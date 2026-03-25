from django.contrib import admin

from .models import Apartment, ApartmentImage, ApartmentPaymentOption, DeveloperCompany, ProjectBuilding, ResidentialProject


admin.site.register(DeveloperCompany)
admin.site.register(ResidentialProject)
admin.site.register(ProjectBuilding)
admin.site.register(Apartment)
admin.site.register(ApartmentImage)
admin.site.register(ApartmentPaymentOption)
