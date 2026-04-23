JAZZ_SETTINGS = {
    # ── Sayt ma'lumoti ──────────────────────────────
    "site_title":        "Mirabad Billing",
    "site_header":       "Mirabad Billing",
    "site_brand":        "Mirabad Billing",
    "site_logo":         None,
    "welcome_sign":      "Mirabad Billing — Operations admin",
    "copyright":         "Mirabad Billing",

    # ── Top menyu ────────────────────────────────────
    "topmenu_links": [
        {"name": "Sayt",  "url": "/",        "new_window": True},
        {"name": "API",   "url": "/api/schema/", "new_window": True},
        {"name": "Swagger", "url": "/api/docs/", "new_window": True},
    ],

    # ── Foydalanuvchi menyu ───────────────────────────
    "usermenu_links": [],

    # ── Asosiy navigatsiya (chap menyu) ─────────────────
    "navigation_expanded": True,
    "hide_apps":  [],
    "hide_models": [],

    # Menyuni o'z tartibida ko'rsatish
    "order_with_respect_to": [
        "main_app",
        "billing",
        "payments",
        "auth",
    ],

    # Ikonkalar (Font Awesome 5)
    "icons": {
        # main_app
        "main_app.complex":         "fas fa-city",
        "main_app.building":        "fas fa-building",
        "main_app.buildingsection": "fas fa-th-large",
        "main_app.apartment":       "fas fa-door-open",
        "main_app.owner":           "fas fa-user-circle",

        # billing
        "billing.billingperiod":             "fas fa-calendar-alt",
        "billing.expense":                   "fas fa-receipt",
        "billing.gasmeterreading":           "fas fa-fire",
        "billing.heatingrecord":             "fas fa-thermometer-half",
        "billing.hotwatermeterreading":      "fas fa-tint",
        "billing.invoice":                   "fas fa-file-invoice-dollar",
        "billing.heatingcalculationsummary": "fas fa-chart-bar",
        "billing.hotwatercalculationsummary":"fas fa-chart-pie",

        # payments
        "payments.transaction":      "fas fa-exchange-alt",
        "payments.paymetransaction": "fas fa-credit-card",

        # auth
        "auth.user":  "fas fa-user",
        "auth.group": "fas fa-users",
    },

    # Defolt ikonka
    "default_icon_parents":  "fas fa-folder",
    "default_icon_children": "fas fa-circle",

    # ── Ko'rinish ─────────────────────────────────────
    "related_modal_active": True,   # FK larni modal oynada ochish
    "show_ui_builder":      False,  # UI builder o'chirilgan (production)
    "changeform_format":    "horizontal_tabs",  # Fieldset ko'rinishi

    # ── Rangli temalar ──────────────────────────────
    # dark / flatly / cosmo / simplex / united / lumen / spacelab
    # bootstrap bilan keladi, o'zgartirish mumkin
    "theme": "flatly",

    # Custom CSS / JS
    "custom_css": "css/admin_custom.css",
    "custom_js":  "js/admin_custom.js",
}

# ── Ilovalarni Sidebar da guruhlash ─────────────────
JAZZ_UI_TWEAKS = {
    "navbar_small_text":   False,
    "footer_small_text":   False,
    "body_small_text":     False,
    "brand_small_text":    False,
    "brand_colour":        "navbar-primary",
    "accent":              "accent-primary",
    "navbar":              "navbar-dark",
    "no_navbar_border":    False,
    "navbar_fixed":        True,
    "layout_boxed":        False,
    "footer_fixed":        False,
    "sidebar_fixed":       True,
    "sidebar":             "sidebar-dark-primary",
    "sidebar_nav_small_text":        False,
    "sidebar_disable_expand":        False,
    "sidebar_nav_child_indent":      True,
    "sidebar_nav_compact_style":     False,
    "sidebar_nav_legacy_style":      False,
    "sidebar_nav_flat_style":        False,
    "theme":                         "flatly",
    "default_theme_mode":            "dark",
    "button_classes": {
        "primary":   "btn-primary",
        "secondary": "btn-secondary",
        "info":      "btn-info",
        "warning":   "btn-warning",
        "danger":    "btn-danger",
        "success":   "btn-success",
    },
}
