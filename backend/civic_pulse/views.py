import json
from datetime import datetime
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.utils.timesince import timesince
from django.utils import timezone
from .models import User, Post, PetitionSignature


@csrf_exempt
@require_POST
def register_view(request):
    """Register a new user with role-based fields."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    role = data.get('role', 'civilian')
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return JsonResponse({'error': 'Email and password are required.'}, status=400)

    if len(password) < 8:
        return JsonResponse({'error': 'Password must be at least 8 characters.'}, status=400)

    if User.objects.filter(email=email).exists():
        return JsonResponse({'error': 'An account with this email already exists.'}, status=400)

    # Use email as username (unique identifier)
    username = email

    user = User(
        username=username,
        email=email,
        role=role,
    )

    # Common fields
    user.phone = data.get('phone', '')
    user.state = data.get('state', '')
    user.city = data.get('city', '')
    user.first_name = data.get('firstName', '')
    user.middle_name = data.get('middleName', '')
    user.last_name = data.get('lastName', '')

    # Civilian fields
    if role == 'civilian':
        user.gender = data.get('gender', '')
        dob = data.get('dob', '')
        if dob:
            try:
                user.dob = datetime.strptime(dob, '%Y-%m-%d').date()
            except ValueError:
                pass

    # Government fields
    elif role == 'gov':
        user.designation = data.get('designation', '')
        user.department = data.get('department', '')

    # NGO fields
    elif role == 'ngo':
        user.org_name = data.get('orgName', '')

    # NSS fields
    elif role == 'nss':
        user.unit_number = data.get('unitNumber', '')
        user.college_name = data.get('collegeName', '')

    user.set_password(password)
    user.save()

    # Auto-login after registration
    login(request, user)

    return JsonResponse({
        'message': 'Account created successfully.',
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.get_full_name() or user.first_name or user.email.split('@')[0],
            'role': user.role,
            'city': user.city,
            'state': user.state,
        }
    }, status=201)


@csrf_exempt
@require_POST
def login_view(request):
    """Login with email + password."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return JsonResponse({'error': 'Email and password are required.'}, status=400)

    # Django's authenticate uses username, but we store email as username
    user = authenticate(request, username=email, password=password)

    if user is None:
        return JsonResponse({'error': 'Invalid email or password.'}, status=401)

    login(request, user)

    return JsonResponse({
        'message': 'Login successful.',
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.get_full_name() or user.first_name or user.email.split('@')[0],
            'role': user.role,
            'city': user.city,
            'state': user.state,
        }
    })


@csrf_exempt
@require_POST
def logout_view(request):
    """Logout the current user."""
    logout(request)
    return JsonResponse({'message': 'Logged out successfully.'})


@require_GET
def me_view(request):
    """Return current authenticated user info."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated.'}, status=401)

    user = request.user
    return JsonResponse({
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.get_full_name() or user.first_name or user.email.split('@')[0],
            'role': user.role,
            'city': user.city,
            'state': user.state,
        }
    })


# ─────────────────────────────────────────────────────────────
#  POST CRUD VIEWS
# ─────────────────────────────────────────────────────────────

def _serialize_post(post, user=None):
    """Serialize a Post instance to a dict."""
    author = post.author
    author_name = (
        author.get_full_name()
        or author.first_name
        or author.email.split('@')[0]
    )

    # Build initials
    parts = author_name.strip().split()
    if len(parts) >= 2:
        initials = f"{parts[0][0]}{parts[-1][0]}".upper()
    elif author_name:
        initials = author_name[0].upper()
    else:
        initials = 'U'

    image_url = None
    if post.image:
        image_url = post.image.url

    # Calculate petition status
    days_since_created = (timezone.now() - post.created_at).days
    is_petition = post.is_petition or (
        post.status in ['pending', 'adopted and pending'] and days_since_created > post.action_timeline_days
    )

    signatures_count = post.signatures.count()
    has_signed = False
    if user and user.is_authenticated:
        has_signed = post.signatures.filter(user=user).exists()

    # Adoption details
    adopted_by = ""
    adopted_date = ""
    progress = 0
    if post.assigned_to:
        # For NGOs and NSS clubs, prioritize org_name or college_name
        assignee = post.assigned_to
        if assignee.role == 'ngo' and assignee.org_name:
            adopted_by = assignee.org_name
        elif assignee.role == 'nss' and assignee.college_name:
            adopted_by = f"NSS Unit, {assignee.college_name}"
        else:
            adopted_by = assignee.get_full_name() or assignee.email.split('@')[0]
        
        # We can just use the post's updated_at as a proxy for adopted date 
        # since status changes updates the timestamp
        adopted_date = timesince(post.updated_at) + ' ago'
        progress = 100 if 'solved' in post.status else 0

    return {
        'id': post.id,
        'caseId': post.case_id,
        'author': author_name,
        'authorId': author.id,
        'authorInitials': initials,
        'timeAgo': timesince(post.created_at) + ' ago',
        'category': post.category,
        'title': post.title,
        'description': post.description,
        'address': post.address,
        'city': post.city,
        'state': post.state,
        'municipalBody': post.municipal_body,
        'status': post.status,
        'actionTimelineDays': post.action_timeline_days,
        'isPetition': is_petition,
        'signaturesCount': signatures_count,
        'hasSigned': has_signed,
        'image': image_url,
        'comments': 0,  # placeholder for future comments feature
        'saved': False,  # placeholder for future save feature
        'createdAt': post.created_at.isoformat(),
        'adoptedBy': adopted_by,
        'adoptedDate': adopted_date,
        'progress': progress,
    }


@csrf_exempt
def posts_view(request):
    """
    GET  /api/posts/          → list all posts (supports ?sort=new|top  &category=pothole|...)
    POST /api/posts/          → create a new post (multipart/form-data for image)
    """
    if request.method == 'GET':
        return _list_posts(request)
    elif request.method == 'POST':
        return _create_post(request)
    return JsonResponse({'error': 'Method not allowed.'}, status=405)


def _list_posts(request):
    """Return a list of posts with optional sorting and category filter."""
    qs = Post.objects.select_related('author').all()

    # Category filter
    category = request.GET.get('category', '').strip()
    if category and category != 'all':
        qs = qs.filter(category=category)

    # Sorting
    sort = request.GET.get('sort', 'new').strip()
    if sort == 'new':
        qs = qs.order_by('-created_at')
    else:
        qs = qs.order_by('-created_at')

    posts = [_serialize_post(p, request.user) for p in qs]
    return JsonResponse({'posts': posts})


def _create_post(request):
    """Create a new post. Requires authentication. Accepts multipart/form-data."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)

    # Support both JSON and multipart
    if request.content_type and 'multipart' in request.content_type:
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        category = request.POST.get('category', '').strip()
        address = request.POST.get('address', '').strip()
        city = request.POST.get('city', '').strip() or request.user.city
        state = request.POST.get('state', '').strip() or request.user.state
        municipal_body = request.POST.get('municipal_body', '').strip()
        image = request.FILES.get('image')
        latitude = request.POST.get('latitude', '').strip() or None
        longitude = request.POST.get('longitude', '').strip() or None
    else:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        category = data.get('category', '').strip()
        address = data.get('address', '').strip()
        city = data.get('city', '').strip() or request.user.city
        state = data.get('state', '').strip() or request.user.state
        municipal_body = data.get('municipalBody', '').strip()
        image = None
        latitude = data.get('latitude') or None
        longitude = data.get('longitude') or None

    # Validation
    if not title:
        return JsonResponse({'error': 'Title is required.'}, status=400)
    if not description:
        return JsonResponse({'error': 'Description is required.'}, status=400)
    if not category:
        return JsonResponse({'error': 'Category is required.'}, status=400)
    if not address:
        return JsonResponse({'error': 'Address is required.'}, status=400)
    if not city:
        return JsonResponse({'error': 'City is required.'}, status=400)
    if not state:
        return JsonResponse({'error': 'State is required.'}, status=400)

    valid_categories = [c[0] for c in Post.CATEGORY_CHOICES]
    if category not in valid_categories:
        return JsonResponse({'error': f'Invalid category. Must be one of: {", ".join(valid_categories)}'}, status=400)

    # Convert lat/long to decimal if provided
    try:
        if latitude is not None:
            latitude = float(latitude)
        if longitude is not None:
            longitude = float(longitude)
    except (ValueError, TypeError):
        latitude = None
        longitude = None

    post = Post.objects.create(
        author=request.user,
        title=title,
        description=description,
        category=category,
        address=address,
        city=city,
        state=state,
        municipal_body=municipal_body,
        image=image,
        latitude=latitude,
        longitude=longitude,
    )

    return JsonResponse({
        'message': 'Post created successfully.',
        'post': _serialize_post(post, request.user),
    }, status=201)


@csrf_exempt
def post_detail_view(request, post_id):
    """
    GET    /api/posts/<id>/    → get single post
    PUT    /api/posts/<id>/    → update post (owner only)
    DELETE /api/posts/<id>/    → delete post (owner only)
    """
    try:
        post = Post.objects.select_related('author').get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({'error': 'Post not found.'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'post': _serialize_post(post, request.user)})

    elif request.method == 'PUT':
        return _update_post(request, post)

    elif request.method == 'DELETE':
        return _delete_post(request, post)

    return JsonResponse({'error': 'Method not allowed.'}, status=405)


def _update_post(request, post):
    """Update a post. Owner only."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)
    if request.user.id != post.author_id:
        return JsonResponse({'error': 'You can only edit your own posts.'}, status=403)

    # Support multipart and JSON
    if request.content_type and 'multipart' in request.content_type:
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        category = request.POST.get('category', '').strip()
        address = request.POST.get('address', '').strip()
        municipal_body = request.POST.get('municipal_body', '').strip()
        image = request.FILES.get('image')
    else:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        category = data.get('category', '').strip()
        address = data.get('address', '').strip()
        municipal_body = data.get('municipalBody', '').strip()
        image = None

    if title:
        post.title = title
    if description:
        post.description = description
    if category:
        valid_categories = [c[0] for c in Post.CATEGORY_CHOICES]
        if category in valid_categories:
            post.category = category
    if address:
        post.address = address
    if municipal_body:
        post.municipal_body = municipal_body
    if image:
        post.image = image

    post.save()

    return JsonResponse({
        'message': 'Post updated successfully.',
        'post': _serialize_post(post, request.user),
    })


def _delete_post(request, post):
    """Delete a post. Owner only."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)
    if request.user.id != post.author_id:
        return JsonResponse({'error': 'You can only delete your own posts.'}, status=403)

    post.delete()
    return JsonResponse({'message': 'Post deleted successfully.'})

@csrf_exempt
@require_POST
def post_status_view(request, post_id):
    """PUT to update exactly the status (Owner only)."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)

    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({'error': 'Post not found.'}, status=404)

    if request.user.id != post.author_id:
        return JsonResponse({'error': 'Only the author can update the status.'}, status=403)

    try:
        data = json.loads(request.body)
        new_status = data.get('status')
        valid_statuses = [s[0] for s in Post.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return JsonResponse({'error': 'Invalid status.'}, status=400)

        post.status = new_status
        post.save()
        return JsonResponse({'message': 'Status updated.', 'status': post.status})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@csrf_exempt
@require_POST
def post_sign_view(request, post_id):
    """POST to sign a petition."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required to sign petition.'}, status=401)

    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({'error': 'Post not found.'}, status=404)

    # Re-calculate petition status to ensure it's eligible
    days_since_created = (timezone.now() - post.created_at).days
    is_petition = post.is_petition or (
        post.status in ['pending', 'adopted and pending'] and days_since_created > post.action_timeline_days
    )

    if not is_petition:
        return JsonResponse({'error': 'This issue is not currently a petition.'}, status=400)

    # Sign it
    signature, created = PetitionSignature.objects.get_or_create(post=post, user=request.user)

    # Persist the is_petition flag if it wasn't already hard-saved
    if not post.is_petition:
        post.is_petition = True
        post.save(update_fields=['is_petition'])

    return JsonResponse({
        'message': 'Petition signed successfully.' if created else 'Already signed.',
        'signaturesCount': post.signatures.count(),
        'hasSigned': True
    })

@csrf_exempt
def post_adopt_view(request, post_id):
    """POST to adopt a petition (NGO/NSS only)."""
    if request.method == 'OPTIONS':
        return JsonResponse({}, status=200)

    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed.'}, status=405)
    """POST to adopt a petition (NGO/NSS only)."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required to adopt problem.'}, status=401)
        
    if request.user.role not in ['ngo', 'nss']:
        return JsonResponse({'error': 'Only NGOs and NSS clubs can adopt problems.'}, status=403)

    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({'error': 'Post not found.'}, status=404)

    if post.status != 'pending':
        return JsonResponse({'error': f'Problem is already {post.status}.'}, status=400)

    # Assign and update status
    post.assigned_to = request.user
    post.status = 'adopted and pending'
    post.save()

    return JsonResponse({
        'message': 'Problem adopted successfully.',
        'post': _serialize_post(post, request.user)
    })

@require_GET
def adopted_posts_view(request):
    """GET /api/posts/adopted/ → list all posts that have been adopted by someone."""
    qs = Post.objects.select_related('author', 'assigned_to').filter(
        assigned_to__isnull=False
    ).order_by('-updated_at')
    
    # Optional search by title
    search = request.GET.get('search', '').strip()
    if search:
        qs = qs.filter(title__icontains=search)

    posts = [_serialize_post(p, request.user) for p in qs]
    return JsonResponse({'posts': posts})

@require_GET
def gov_dashboard_view(request):
    """GET /api/gov/dashboard/ → Dashboard data for gov users."""
    if not request.user.is_authenticated or request.user.role != 'gov':
        return JsonResponse({'error': 'Unauthorized. Gov access required.'}, status=403)
    
    # Base filter: jurisdiction (city and state)
    qs = Post.objects.filter(city__iexact=request.user.city, state__iexact=request.user.state)
    
    # Filter by department (municipal_body) if set and specific
    if request.user.department and request.user.department.lower() != 'other':
        qs = qs.filter(municipal_body__icontains=request.user.department)
    
    # Compute basic stats
    total_reports = qs.count()
    pending_count = qs.filter(status__in=['pending', 'adopted and pending']).count()
    solved_count = qs.filter(status__in=['solved', 'adopted and solved']).count()
    
    # Compute chart data: categories distribution
    from django.db.models import Count
    cat_distribution = qs.values('category').annotate(count=Count('id'))
    categories_data = [{'category': item['category'], 'count': item['count']} for item in cat_distribution]
    
    # Timeline data (last 7 days)
    from django.utils import timezone
    from datetime import timedelta
    today = timezone.now().date()
    timeline_data = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = qs.filter(created_at__date=day).count()
        timeline_data.append({'date': day.strftime('%b %d'), 'count': count})
        
    # Serialize filtered posts to display in the feed
    posts = [_serialize_post(p, request.user) for p in qs.order_by('-created_at')]
    
    return JsonResponse({
        'stats': {
            'total': total_reports,
            'pending': pending_count,
            'solved': solved_count
        },
        'chartData': {
            'categories': categories_data,
            'timeline': timeline_data
        },
        'posts': posts
    })
