from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Custom user model supporting 4 roles."""

    ROLE_CHOICES = [
        ('civilian', 'Civilian'),
        ('gov', 'Government'),
        ('ngo', 'NGO Organisation'),
        ('nss', 'NSS Club'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not', 'Prefer not to say'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='civilian')
    middle_name = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')

    # Gov-specific fields
    designation = models.CharField(max_length=200, blank=True, default='')
    department = models.CharField(max_length=200, blank=True, default='')

    # NGO-specific fields
    org_name = models.CharField(max_length=300, blank=True, default='')

    # NSS-specific fields
    college_name = models.CharField(max_length=300, blank=True, default='')
    unit_number = models.CharField(max_length=100, blank=True, default='')

    def get_full_name(self):
        parts = [self.first_name, self.middle_name, self.last_name]
        return " ".join([str(p).strip() for p in parts if p and str(p).strip()])

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


# ─── Indian state → 2-letter code mapping ───
STATE_CODE_MAP = {
    'andhra pradesh': 'AP',
    'arunachal pradesh': 'AR',
    'assam': 'AS',
    'bihar': 'BR',
    'chhattisgarh': 'CG',
    'goa': 'GA',
    'gujarat': 'GJ',
    'haryana': 'HR',
    'himachal pradesh': 'HP',
    'jharkhand': 'JH',
    'karnataka': 'KA',
    'kerala': 'KL',
    'madhya pradesh': 'MP',
    'maharashtra': 'MH',
    'manipur': 'MN',
    'meghalaya': 'ML',
    'mizoram': 'MZ',
    'nagaland': 'NL',
    'odisha': 'OD',
    'punjab': 'PB',
    'rajasthan': 'RJ',
    'sikkim': 'SK',
    'tamil nadu': 'TN',
    'telangana': 'TS',
    'tripura': 'TR',
    'uttar pradesh': 'UP',
    'uttarakhand': 'UK',
    'west bengal': 'WB',
    # Union territories
    'andaman and nicobar islands': 'AN',
    'chandigarh': 'CH',
    'dadra and nagar haveli and daman and diu': 'DD',
    'delhi': 'DL',
    'jammu and kashmir': 'JK',
    'ladakh': 'LA',
    'lakshadweep': 'LD',
    'puducherry': 'PY',
}

# Category → 3-letter code mapping
CATEGORY_CODE_MAP = {
    'pothole': 'POT',
    'garbage': 'GAR',
    'water': 'WAT',
    'electricity': 'ELC',
    'environment': 'ENV',
    'safety': 'SAF',
    'other': 'OTH',
}


class Post(models.Model):
    """A community issue report (petition) with auto-generated case ID."""

    CATEGORY_CHOICES = [
        ('pothole', 'Pothole / Road Damage'),
        ('garbage', 'Garbage / Waste'),
        ('water', 'Water Supply / Drainage'),
        ('electricity', 'Electricity / Street Lights'),
        ('environment', 'Environment / Trees'),
        ('safety', 'Public Safety'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('solved', 'Solved'),
        ('adopted and pending', 'Adopted and Pending'),
        ('adopted and solved', 'Adopted and Solved'),
    ]

    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='posts'
    )
    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, related_name='assigned_posts', null=True, blank=True
    )
    case_id = models.CharField(max_length=30, unique=True, blank=True)
    title = models.CharField(max_length=300)
    description = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    action_timeline_days = models.IntegerField(default=5)
    is_petition = models.BooleanField(default=False)
    address = models.CharField(max_length=500)
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    municipal_body = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)

    # Geolocation (stored but not exposed to frontend)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.case_id}] {self.title[:40]} – {self.author.username}"

    def save(self, *args, **kwargs):
        """Auto-generate case_id on first save: CP-<STATE>-<CATEGORY>-<SEQ>"""
        if not self.case_id:
            state_code = self._resolve_state_code()
            cat_code = CATEGORY_CODE_MAP.get(self.category, 'OTH')

            # Count existing posts with same state+category prefix to build seq
            prefix = f"CP-{state_code}-{cat_code}-"
            existing_count = Post.objects.filter(
                case_id__startswith=prefix
            ).count()
            seq = str(existing_count + 1).zfill(5)

            self.case_id = f"{prefix}{seq}"

        # Assign action_timeline_days based on category if creating new post
        if not self.pk and getattr(self, 'action_timeline_days', None) == 5:
            # Override default based on category mapping
            timeline_map = {
                'electricity': 2,
                'water': 2,
                'garbage': 3,
                'safety': 3,
                'pothole': 7,
                'environment': 7,
                'other': 5
            }
            self.action_timeline_days = timeline_map.get(self.category, 5)

        # Auto-assign municipal body based on city
        if self.city and not self.municipal_body:
            city_lower = self.city.strip().lower()
            CITY_MUNICIPAL_BODY_MAP = {
                'mumbai': 'BMC / MCGM',
                'amravati': 'AMC',
                'pune': 'PMC',
                'nagpur': 'NMC',
                'nashik': 'NMC',
                'thane': 'TMC',
            }
            if city_lower in CITY_MUNICIPAL_BODY_MAP:
                self.municipal_body = CITY_MUNICIPAL_BODY_MAP[city_lower]
        
        # If still no municipal body, default to something generic or leave empty
        if not self.municipal_body:
            self.municipal_body = f"{self.city.title()} Municipal Corporation" if self.city else "Municipal Corporation"

        super().save(*args, **kwargs)

    def _resolve_state_code(self):
        """Derive state code from the author's state field, or from address."""
        # Try author's registered state first
        author_state = (self.author.state or '').strip().lower()
        if author_state and author_state in STATE_CODE_MAP:
            return STATE_CODE_MAP[author_state]

        # Try to detect state from the address text
        address_lower = (self.address or '').lower()
        for state_name, code in STATE_CODE_MAP.items():
            if state_name in address_lower:
                return code

        return 'XX'  # Unknown state fallback

class PetitionSignature(models.Model):
    """Tracks users who have signed a petition (escalated post)."""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='signatures')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')

    def __str__(self):
        return f"{self.user.username} signed {self.post.case_id}"

