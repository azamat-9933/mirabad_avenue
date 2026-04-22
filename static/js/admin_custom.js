(function () {
    "use strict";

    const STORAGE_KEY = "hydroflow-admin-lang";
    const LANGS = [
        ["ru", "RU"],
        ["en", "EN"],
        ["uz", "UZ"],
    ];

    const catalog = {
        // Navigation and app names
        "Dashboard": { en: "Dashboard", ru: "Админпанель", uz: "Adminpanel" },
        "Home": { en: "Home", ru: "Начало", uz: "Bosh sahifa" },
        "Administration": { en: "Administration", ru: "Администрирование", uz: "Administratsiya" },
        "Site": { en: "Site", ru: "Сайт", uz: "Sayt" },
        "API": { en: "API", ru: "API", uz: "API" },
        "Swagger": { en: "Swagger", ru: "Swagger", uz: "Swagger" },
        "Main app": { en: "Property management", ru: "Управление домами", uz: "Uylarni boshqarish" },
        "Property management": { en: "Property management", ru: "Управление домами", uz: "Uylarni boshqarish" },
        "Upravenie domami": { en: "Property management", ru: "Управление домами", uz: "Uylarni boshqarish" },
        "Upravlenie domami": { en: "Property management", ru: "Управление домами", uz: "Uylarni boshqarish" },
        "Управление domami": { en: "Property management", ru: "Управление домами", uz: "Uylarni boshqarish" },
        "Управление домами": { en: "Property management", ru: "Управление домами", uz: "Uylarni boshqarish" },
        "Billing": { en: "Billing", ru: "Биллинг", uz: "Billing" },
        "Payments": { en: "Payments", ru: "Платежи", uz: "To'lovlar" },
        "To'lovlar": { en: "Payments", ru: "Платежи", uz: "To'lovlar" },
        "To‘lovlar": { en: "Payments", ru: "Платежи", uz: "To'lovlar" },
        "Authentication and Authorization": { en: "Users and groups", ru: "Пользователи и группы", uz: "Foydalanuvchilar va guruhlar" },
        "Foydalanuvchilar va guruhlar": { en: "Users and groups", ru: "Пользователи и группы", uz: "Foydalanuvchilar va guruhlar" },
        "Groups": { en: "Groups", ru: "Группы", uz: "Guruhlar" },
        "Users": { en: "Users", ru: "Пользователи", uz: "Foydalanuvchilar" },
        "Group": { en: "Group", ru: "Группа", uz: "Guruh" },
        "User": { en: "User", ru: "Пользователь", uz: "Foydalanuvchi" },
        "Guruh": { en: "Group", ru: "Группа", uz: "Guruh" },
        "Guruhlar": { en: "Groups", ru: "Группы", uz: "Guruhlar" },
        "Foydalanuvchi": { en: "User", ru: "Пользователь", uz: "Foydalanuvchi" },
        "Foydalanuvchilar": { en: "Users", ru: "Пользователи", uz: "Foydalanuvchilar" },

        // Models
        "Complex": { en: "Complex", ru: "ЖК", uz: "Turar joy majmuasi" },
        "Complexes": { en: "Complexes", ru: "Жилые комплексы", uz: "Turar joy majmualari" },
        "Turar joy majmuasi": { en: "Residential complex", ru: "Жилой комплекс", uz: "Turar joy majmuasi" },
        "Turar joy majmualari": { en: "Residential complexes", ru: "Жилые комплексы", uz: "Turar joy majmualari" },
        "Building": { en: "Building", ru: "Дом", uz: "Uy" },
        "Buildings": { en: "Buildings", ru: "Дома", uz: "Uylar" },
        "Uy": { en: "Building", ru: "Дом", uz: "Uy" },
        "Uylar": { en: "Buildings", ru: "Дома", uz: "Uylar" },
        "Apartment": { en: "Apartment", ru: "Квартира", uz: "Kvartira" },
        "Apartments": { en: "Apartments", ru: "Квартиры", uz: "Kvartiralar" },
        "Kvartira": { en: "Apartment", ru: "Квартира", uz: "Kvartira" },
        "Kvartiralar": { en: "Apartments", ru: "Квартиры", uz: "Kvartiralar" },
        "Section": { en: "Section", ru: "Секция", uz: "Seksiya" },
        "Sections": { en: "Sections", ru: "Секции", uz: "Seksiyalar" },
        "Seksiya": { en: "Section", ru: "Секция", uz: "Seksiya" },
        "Seksiyalar": { en: "Sections", ru: "Секции", uz: "Seksiyalar" },
        "Owner": { en: "Owner", ru: "Владелец", uz: "Ega" },
        "Owners": { en: "Owners", ru: "Владельцы", uz: "Egalar" },
        "Ega": { en: "Owner", ru: "Владелец", uz: "Ega" },
        "Egalar": { en: "Owners", ru: "Владельцы", uz: "Egalar" },
        "Billing period": { en: "Billing period", ru: "Расчётный период", uz: "Xisoblash davri" },
        "Billing periods": { en: "Billing periods", ru: "Расчётные периоды", uz: "Xisoblash davrlari" },
        "Xisoblash davri": { en: "Billing period", ru: "Расчётный период", uz: "Xisoblash davri" },
        "Xisoblash davrlari": { en: "Billing periods", ru: "Расчётные периоды", uz: "Xisoblash davrlari" },
        "Expense": { en: "Expense", ru: "Расход", uz: "Xarajat" },
        "Expenses": { en: "Expenses", ru: "Расходы", uz: "Xarajatlar" },
        "Xarajat": { en: "Expense", ru: "Расход", uz: "Xarajat" },
        "Xarajatlar": { en: "Expenses", ru: "Расходы", uz: "Xarajatlar" },
        "Gas meter reading": { en: "Gas meter reading", ru: "Показание газового счётчика", uz: "Gaz hisoblagich ko'rsatkichi" },
        "Gas meter readings": { en: "Gas meter readings", ru: "Показания газовых счётчиков", uz: "Gaz hisoblagich ko'rsatkichlari" },
        "Gaz hisoblagich ko'rsatkichi": { en: "Gas meter reading", ru: "Показание газового счётчика", uz: "Gaz hisoblagich ko'rsatkichi" },
        "Gaz hisoblagich ko'rsatkichlari": { en: "Gas meter readings", ru: "Показания газовых счётчиков", uz: "Gaz hisoblagich ko'rsatkichlari" },
        "Hot water meter reading": { en: "Hot water meter reading", ru: "Показание ГВС", uz: "GVS hisoblagich ko'rsatkichi" },
        "Hot water meter readings": { en: "Hot water meter readings", ru: "Показания ГВС", uz: "GVS hisoblagich ko'rsatkichlari" },
        "GVS hisoblagich ko'rsatkichi": { en: "Hot water meter reading", ru: "Показание ГВС", uz: "GVS hisoblagich ko'rsatkichi" },
        "GVS hisoblagich ko'rsatkichlari": { en: "Hot water meter readings", ru: "Показания ГВС", uz: "GVS hisoblagich ko'rsatkichlari" },
        "Heating record": { en: "Heating record", ru: "Расчёт отопления", uz: "Isitish hisobi" },
        "Heating records": { en: "Heating records", ru: "Расчёты отопления", uz: "Isitish hisoblari" },
        "Isitish hisobi": { en: "Heating record", ru: "Расчёт отопления", uz: "Isitish hisobi" },
        "Isitish hisoblari": { en: "Heating records", ru: "Расчёты отопления", uz: "Isitish hisoblari" },
        "Invoice": { en: "Invoice", ru: "Счёт", uz: "Hisob-faktura" },
        "Invoices": { en: "Invoices", ru: "Счета", uz: "Hisob-fakturalar" },
        "Hisob-faktura": { en: "Invoice", ru: "Счёт", uz: "Hisob-faktura" },
        "Hisob-fakturalar": { en: "Invoices", ru: "Счета", uz: "Hisob-fakturalar" },
        "Transaction": { en: "Transaction", ru: "Транзакция", uz: "To'lov tranzaksiya" },
        "Transactions": { en: "Transactions", ru: "Транзакции", uz: "To'lov tranzaksiyalari" },
        "Payme transaction": { en: "Payme transaction", ru: "Транзакция Payme", uz: "Payme tranzaksiya" },
        "Payme transactions": { en: "Payme transactions", ru: "Транзакции Payme", uz: "Payme tranzaksiyalari" },
        "Payme tranzaksiya": { en: "Payme transaction", ru: "Транзакция Payme", uz: "Payme tranzaksiya" },
        "Payme tranzaksiyalari": { en: "Payme transactions", ru: "Транзакции Payme", uz: "Payme tranzaksiyalari" },
        "Heating calculation summary": { en: "Heating calculation summary", ru: "Сводка расчёта отопления", uz: "Isitish hisoblash xulosasi" },
        "Heating calculation summaries": { en: "Heating calculation summaries", ru: "Сводки расчёта отопления", uz: "Isitish hisoblash xulosalari" },
        "Isitish hisoblash xulosasi": { en: "Heating calculation summary", ru: "Сводка расчёта отопления", uz: "Isitish hisoblash xulosasi" },
        "Isitish hisoblash xulosalari": { en: "Heating calculation summaries", ru: "Сводки расчёта отопления", uz: "Isitish hisoblash xulosalari" },
        "Hot water calculation summary": { en: "Hot water calculation summary", ru: "Сводка расчёта ГВС", uz: "GVS hisoblash xulosasi" },
        "Hot water calculation summaries": { en: "Hot water calculation summaries", ru: "Сводки расчёта ГВС", uz: "GVS hisoblash xulosalari" },
        "GVS hisoblash xulosasi": { en: "Hot water calculation summary", ru: "Сводка расчёта ГВС", uz: "GVS hisoblash xulosasi" },
        "GVS hisoblash xulosalari": { en: "Hot water calculation summaries", ru: "Сводки расчёта ГВС", uz: "GVS hisoblash xulosalari" },
        "Workspace profile": { en: "Workspace profile", ru: "Профиль workspace", uz: "Workspace profili" },
        "Workspace profiles": { en: "Workspace profiles", ru: "Профили workspace", uz: "Workspace profillari" },
        "Portal notification": { en: "Portal notification", ru: "Уведомление портала", uz: "Portal bildirishnomasi" },
        "Portal notifications": { en: "Portal notifications", ru: "Уведомления портала", uz: "Portal bildirishnomalari" },
        "System alert": { en: "System alert", ru: "Системный alert", uz: "Tizim ogohlantirishi" },
        "System alerts": { en: "System alerts", ru: "Системные alerts", uz: "Tizim ogohlantirishlari" },
        "Maintenance task": { en: "Maintenance task", ru: "Задача обслуживания", uz: "Xizmat vazifasi" },
        "Maintenance tasks": { en: "Maintenance tasks", ru: "Задачи обслуживания", uz: "Xizmat vazifalari" },
        "Checklist item": { en: "Checklist item", ru: "Пункт чеклиста", uz: "Ro'yxat bandi" },
        "Checklist items": { en: "Checklist items", ru: "Пункты чеклиста", uz: "Ro'yxat bandlari" },
        "Audit event": { en: "Audit event", ru: "Событие аудита", uz: "Audit hodisasi" },
        "Audit events": { en: "Audit events", ru: "События аудита", uz: "Audit hodisalari" },
        "Telemetry node": { en: "Telemetry node", ru: "Узел телеметрии", uz: "Telemetriya tuguni" },
        "Telemetry nodes": { en: "Telemetry nodes", ru: "Узлы телеметрии", uz: "Telemetriya tugunlari" },
        "Telemetry sample": { en: "Telemetry sample", ru: "Замер телеметрии", uz: "Telemetriya namunasi" },
        "Telemetry samples": { en: "Telemetry samples", ru: "Замеры телеметрии", uz: "Telemetriya namunalari" },

        // Common Django admin UI
        "Add": { en: "Add", ru: "Добавить", uz: "Qo'shish" },
        "Change": { en: "Change", ru: "Изменить", uz: "O'zgartirish" },
        "View": { en: "View", ru: "Просмотр", uz: "Ko'rish" },
        "Delete": { en: "Delete", ru: "Удалить", uz: "O'chirish" },
        "Save": { en: "Save", ru: "Сохранить", uz: "Saqlash" },
        "Saqlash": { en: "Save", ru: "Сохранить", uz: "Saqlash" },
        "Сохранить": { en: "Save", ru: "Сохранить", uz: "Saqlash" },
        "Save and continue editing": { en: "Save and continue editing", ru: "Сохранить и продолжить", uz: "Saqlash va tahrirlashni davom ettirish" },
        "Save and continue": { en: "Save and continue editing", ru: "Сохранить и продолжить", uz: "Saqlash va tahrirlashni davom ettirish" },
        "Сохранить и продолжить редактирование": { en: "Save and continue editing", ru: "Сохранить и продолжить", uz: "Saqlash va tahrirlashni davom ettirish" },
        "Сохранить и продолжить": { en: "Save and continue editing", ru: "Сохранить и продолжить", uz: "Saqlash va tahrirlashni davom ettirish" },
        "Save and add another": { en: "Save and add another", ru: "Сохранить и добавить ещё", uz: "Saqlash va yana qo'shish" },
        "Сохранить и добавить другой объект": { en: "Save and add another", ru: "Сохранить и добавить ещё", uz: "Saqlash va yana qo'shish" },
        "Сохранить и добавить ещё": { en: "Save and add another", ru: "Сохранить и добавить ещё", uz: "Saqlash va yana qo'shish" },
        "Save as new": { en: "Save as new", ru: "Сохранить как новое", uz: "Yangi qilib saqlash" },
        "History": { en: "History", ru: "История", uz: "Tarix" },
        "История": { en: "History", ru: "История", uz: "Tarix" },
        "Account": { en: "Account", ru: "Аккаунт", uz: "Akkaunt" },
        "Аккаунт": { en: "Account", ru: "Аккаунт", uz: "Akkaunt" },
        "Profile": { en: "Profile", ru: "Профиль", uz: "Profil" },
        "Profil": { en: "Profile", ru: "Профиль", uz: "Profil" },
        "Профиль": { en: "Profile", ru: "Профиль", uz: "Profil" },
        "Change password": { en: "Change password", ru: "Изменить пароль", uz: "Parolni o'zgartirish" },
        "Изменить пароль": { en: "Change password", ru: "Изменить пароль", uz: "Parolni o'zgartirish" },
        "Logout": { en: "Sign out", ru: "Выйти", uz: "Chiqish" },
        "Log out": { en: "Sign out", ru: "Выйти", uz: "Chiqish" },
        "Sign out": { en: "Sign out", ru: "Выйти", uz: "Chiqish" },
        "Выйти": { en: "Sign out", ru: "Выйти", uz: "Chiqish" },
        "Close": { en: "Close", ru: "Закрыть", uz: "Yopish" },
        "Search": { en: "Search", ru: "Поиск", uz: "Qidirish" },
        "Find": { en: "Find", ru: "Найти", uz: "Qidirish" },
        "Qidirish": { en: "Find", ru: "Найти", uz: "Qidirish" },
        "Найти": { en: "Find", ru: "Найти", uz: "Qidirish" },
        "Go": { en: "Go", ru: "Выполнить", uz: "Bajarish" },
        "Bajarish": { en: "Go", ru: "Выполнить", uz: "Bajarish" },
        "Action": { en: "Action", ru: "Действие", uz: "Amal" },
        "Actions": { en: "Actions", ru: "Действия", uz: "Amallar" },
        "Run the selected action": { en: "Run", ru: "Выполнить", uz: "Bajarish" },
        "All": { en: "All", ru: "Все", uz: "Hammasi" },
        "Все даты": { en: "All dates", ru: "Все даты", uz: "Barcha sanalar" },
        "All dates": { en: "All dates", ru: "Все даты", uz: "Barcha sanalar" },
        "Barcha sanalar": { en: "All dates", ru: "Все даты", uz: "Barcha sanalar" },
        "Апрель 2026 г.": { en: "April 2026", ru: "Апрель 2026 г.", uz: "Aprel 2026" },
        "April 2026": { en: "April 2026", ru: "Апрель 2026 г.", uz: "Aprel 2026" },
        "Aprel 2026": { en: "April 2026", ru: "Апрель 2026 г.", uz: "Aprel 2026" },
        "Yes": { en: "Yes", ru: "Да", uz: "Ha" },
        "No": { en: "No", ru: "Нет", uz: "Yo'q" },
        "Unknown": { en: "Unknown", ru: "Неизвестно", uz: "Noma'lum" },
        "None": { en: "None", ru: "Нет", uz: "Yo'q" },
        "Filter": { en: "Filter", ru: "Фильтр", uz: "Filtr" },
        "By": { en: "By", ru: "По", uz: "Bo'yicha" },
        "Today": { en: "Today", ru: "Сегодня", uz: "Bugun" },
        "Past 7 days": { en: "Past 7 days", ru: "Последние 7 дней", uz: "Oxirgi 7 kun" },
        "This month": { en: "This month", ru: "Этот месяц", uz: "Bu oy" },
        "This year": { en: "This year", ru: "Этот год", uz: "Bu yil" },
        "Main information": { en: "Main information", ru: "Основная информация", uz: "Asosiy ma'lumot" },
        "Основная информация": { en: "Main information", ru: "Основная информация", uz: "Asosiy ma'lumot" },
        "Asosiy ma'lumot": { en: "Main information", ru: "Основная информация", uz: "Asosiy ma'lumot" },
        "Personal information": { en: "Personal information", ru: "Персональная информация", uz: "Shaxsiy ma'lumot" },
        "Персональная информация": { en: "Personal information", ru: "Персональная информация", uz: "Shaxsiy ma'lumot" },
        "Personal data": { en: "Personal data", ru: "Личные данные", uz: "Shaxsiy ma'lumot" },
        "Личные данные": { en: "Personal data", ru: "Личные данные", uz: "Shaxsiy ma'lumot" },
        "Balance": { en: "Balance", ru: "Баланс", uz: "Balans" },
        "Balans": { en: "Balance", ru: "Баланс", uz: "Balans" },
        "Positive balance means credit. Negative balance means debt.": { en: "Positive balance means credit. Negative balance means debt.", ru: "Положительный баланс — переплата. Отрицательный баланс — долг.", uz: "Musbat balans — ortiqcha to'lov. Manfiy balans — qarz." },
        "Musbat — ortiqcha to'lov. Manfiy — qarz.": { en: "Positive balance means credit. Negative balance means debt.", ru: "Положительный баланс — переплата. Отрицательный баланс — долг.", uz: "Musbat balans — ortiqcha to'lov. Manfiy balans — qarz." },
        "Use complex, building and section as helpers, then select the exact apartment.": { en: "Use complex, building and section as helpers, then select the exact apartment.", ru: "Выберите ЖК, дом и секцию как фильтры, затем выберите точную квартиру.", uz: "Aniq kvartirani tanlash uchun avval kompleks, uy va seksiyani filtr sifatida tanlang." },
        "Optional helper filter for selecting the apartment.": { en: "Optional helper filter for selecting the apartment.", ru: "Вспомогательный фильтр для выбора квартиры.", uz: "Kvartirani tanlash uchun yordamchi filtr." },
        "Only apartments without an assigned owner are shown. To change an occupied apartment, edit the existing owner.": { en: "Only apartments without an assigned owner are shown. To change an occupied apartment, edit the existing owner.", ru: "Показаны только квартиры без владельца. Чтобы изменить занятую квартиру, откройте существующего владельца.", uz: "Faqat egasi biriktirilmagan kvartiralar ko'rsatiladi. Band kvartirani o'zgartirish uchun mavjud egani tahrirlang." },
        "Selected apartment does not belong to this complex.": { en: "Selected apartment does not belong to this complex.", ru: "Выбранная квартира не относится к этому ЖК.", uz: "Tanlangan kvartira bu kompleksga tegishli emas." },
        "Selected apartment does not belong to this building.": { en: "Selected apartment does not belong to this building.", ru: "Выбранная квартира не относится к этому дому.", uz: "Tanlangan kvartira bu uyga tegishli emas." },
        "Selected apartment does not belong to this section.": { en: "Selected apartment does not belong to this section.", ru: "Выбранная квартира не относится к этой секции.", uz: "Tanlangan kvartira bu seksiyaga tegishli emas." },
        "No section": { en: "No section", ru: "Без секции", uz: "Seksiyasiz" },
        "Apt.": { en: "Apt.", ru: "Кв.", uz: "Kv." },
        "Permissions": { en: "Permissions", ru: "Права доступа", uz: "Ruxsatlar" },
        "Права доступа": { en: "Permissions", ru: "Права доступа", uz: "Ruxsatlar" },
        "Important dates": { en: "Important dates", ru: "Важные даты", uz: "Muhim sanalar" },
        "Важные даты": { en: "Important dates", ru: "Важные даты", uz: "Muhim sanalar" },
        "User": { en: "User", ru: "Пользователь", uz: "Foydalanuvchi" },
        "Workspace": { en: "Workspace", ru: "Workspace", uz: "Workspace" },
        "Content": { en: "Content", ru: "Контент", uz: "Kontent" },
        "System": { en: "System", ru: "Система", uz: "Sistema" },
        "Relations": { en: "Relations", ru: "Связи", uz: "Aloqalar" },
        "Ownership": { en: "Ownership", ru: "Ответственность", uz: "Egalik" },
        "Timeline": { en: "Timeline", ru: "Таймлайн", uz: "Vaqt chizig'i" },
        "Event": { en: "Event", ru: "Событие", uz: "Hodisa" },
        "Task": { en: "Task", ru: "Задача", uz: "Vazifa" },
        "Schedule": { en: "Schedule", ru: "Расписание", uz: "Jadval" },
        "Details": { en: "Details", ru: "Детали", uz: "Tafsilotlar" },
        "Portal note": { en: "Portal note", ru: "Заметка портала", uz: "Portal izohi" },
        "Alert": { en: "Alert", ru: "Alert", uz: "Ogohlantirish" },
        "Node": { en: "Node", ru: "Узел", uz: "Tugun" },
        "Kvartira va davr": { en: "Apartment and period", ru: "Квартира и период", uz: "Kvartira va davr" },
        "Isitish kunlari": { en: "Heating days", ru: "Дни отопления", uz: "Isitish kunlari" },
        "Hisoblash natijasi": { en: "Calculation result", ru: "Результат расчёта", uz: "Hisoblash natijasi" },
        "Hisoblagich ko'rsatkichlari": { en: "Meter readings", ru: "Показания счётчика", uz: "Hisoblagich ko'rsatkichlari" },
        "Jami": { en: "Total", ru: "Итого", uz: "Jami" },
        "Qayta hisoblash": { en: "Recalculation", ru: "Перерасчёт", uz: "Qayta hisoblash" },
        "Username": { en: "Username", ru: "Имя пользователя", uz: "Foydalanuvchi nomi" },
        "Имя пользователя": { en: "Username", ru: "Имя пользователя", uz: "Foydalanuvchi nomi" },
        "Password": { en: "Password", ru: "Пароль", uz: "Parol" },
        "Пароль": { en: "Password", ru: "Пароль", uz: "Parol" },
        "Reset password": { en: "Reset password", ru: "Сбросить пароль", uz: "Parolni tiklash" },
        "Сбросить пароль": { en: "Reset password", ru: "Сбросить пароль", uz: "Parolni tiklash" },
        "Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.": { en: "Required. Up to 150 characters. Letters, digits and @/./+/-/_ only.", ru: "Обязательное поле. До 150 символов. Только буквы, цифры и @/./+/-/_.", uz: "Majburiy. 150 belgigacha. Faqat harflar, raqamlar va @/./+/-/_." },
        "Raw passwords are not stored, so there is no way to see this user's password.": { en: "Raw passwords are not stored, so the password cannot be viewed.", ru: "Сырые пароли не хранятся, поэтому посмотреть пароль нельзя.", uz: "Xom parollar saqlanmaydi, shuning uchun parolni ko'rib bo'lmaydi." },
        "Мы не храним сырые пароли, поэтому не существует способа посмотреть пароль пользователя.": { en: "Raw passwords are not stored, so the password cannot be viewed.", ru: "Сырые пароли не хранятся, поэтому посмотреть пароль нельзя.", uz: "Xom parollar saqlanmaydi, shuning uchun parolni ko'rib bo'lmaydi." },

        // Fields and columns
        "FIO": { en: "Full name", ru: "ФИО", uz: "FIO" },
        "Telefon": { en: "Phone", ru: "Телефон", uz: "Telefon" },
        "Phone": { en: "Phone", ru: "Телефон", uz: "Telefon" },
        "Kvartira": { en: "Apartment", ru: "Квартира", uz: "Kvartira" },
        "Balans (so'm)": { en: "Balance (UZS)", ru: "Баланс (UZS)", uz: "Balans (so'm)" },
        "Balans": { en: "Balance", ru: "Баланс", uz: "Balans" },
        "Telegram status": { en: "Telegram status", ru: "Статус Telegram", uz: "Telegram status" },
        "Telegram id": { en: "Telegram ID", ru: "Telegram ID", uz: "Telegram ID" },
        "Telegram ID": { en: "Telegram ID", ru: "Telegram ID", uz: "Telegram ID" },
        "Telegram user": { en: "Telegram user", ru: "Пользователь Telegram", uz: "Telegram foydalanuvchi" },
        "Created at": { en: "Created at", ru: "Создано", uz: "Created at" },
        "Generated automatically after save.": { en: "Generated automatically after save.", ru: "Будет создано автоматически после сохранения.", uz: "Saqlangandan keyin avtomatik yaratiladi." },
        "Performed at": { en: "Performed at", ru: "Проведено", uz: "Bajarilgan vaqt" },
        "Cancelled at": { en: "Cancelled at", ru: "Отменено", uz: "Bekor qilingan vaqt" },
        "Payme id": { en: "Payme ID", ru: "Payme ID", uz: "Payme ID" },
        "Payme ID": { en: "Payme ID", ru: "Payme ID", uz: "Payme ID" },
        "Account Owner ID": { en: "Account (Owner ID)", ru: "Аккаунт (ID владельца)", uz: "Account (Owner ID)" },
        "Created by": { en: "Created by", ru: "Создал", uz: "Kim tomonidan" },
        "Yaratuvchi": { en: "Created by", ru: "Создал", uz: "Yaratuvchi" },
        "Nomi": { en: "Name", ru: "Название", uz: "Nomi" },
        "Name": { en: "Name", ru: "Название", uz: "Nomi" },
        "Title": { en: "Title", ru: "Название", uz: "Nomi" },
        "Manzili": { en: "Address", ru: "Адрес", uz: "Manzili" },
        "Manzil": { en: "Address", ru: "Адрес", uz: "Manzil" },
        "Address": { en: "Address", ru: "Адрес", uz: "Manzil" },
        "Uy raqami": { en: "Building number", ru: "Номер дома", uz: "Uy raqami" },
        "Kvartira raqami": { en: "Apartment number", ru: "Номер квартиры", uz: "Kvartira raqami" },
        "Seksiya nomi": { en: "Section name", ru: "Название секции", uz: "Seksiya nomi" },
        "Maydon (m²)": { en: "Area (m²)", ru: "Площадь (м²)", uz: "Maydon (m²)" },
        "Umumiy maydon (m²)": { en: "Total area (m²)", ru: "Общая площадь (м²)", uz: "Umumiy maydon (m²)" },
        "Kvartiralar soni": { en: "Apartments", ru: "Квартир", uz: "Kvartiralar soni" },
        "Uylar soni": { en: "Buildings", ru: "Домов", uz: "Uylar soni" },
        "Davr": { en: "Period", ru: "Период", uz: "Davr" },
        "Davr nomi": { en: "Period name", ru: "Название периода", uz: "Davr nomi" },
        "Boshlanish sanasi": { en: "Start date", ru: "Дата начала", uz: "Boshlanish sanasi" },
        "Tugash sanasi": { en: "End date", ru: "Дата окончания", uz: "Tugash sanasi" },
        "Holat": { en: "Status", ru: "Статус", uz: "Holat" },
        "Status": { en: "Status", ru: "Статус", uz: "Holat" },
        "Yopilgan vaqt": { en: "Closed at", ru: "Закрыто", uz: "Yopilgan vaqt" },
        "Xizmat turi": { en: "Service type", ru: "Тип услуги", uz: "Xizmat turi" },
        "Xarajat nomi": { en: "Expense name", ru: "Название расхода", uz: "Xarajat nomi" },
        "Summa": { en: "Amount", ru: "Сумма", uz: "Summa" },
        "Summa (so'm)": { en: "Amount (UZS)", ru: "Сумма (UZS)", uz: "Summa (so'm)" },
        "Start reading": { en: "Start reading", ru: "Начальное показание", uz: "Boshlang'ich ko'rsatkich" },
        "End reading": { en: "End reading", ru: "Конечное показание", uz: "Oxirgi ko'rsatkich" },
        "Boshlang'ich ko'rsatkich (kub)": { en: "Start reading (m³)", ru: "Начальное показание (м³)", uz: "Boshlang'ich ko'rsatkich (kub)" },
        "Oxirgi ko'rsatkich (kub)": { en: "End reading (m³)", ru: "Конечное показание (м³)", uz: "Oxirgi ko'rsatkich (kub)" },
        "1 kub narxi (so'm)": { en: "Price per m³ (UZS)", ru: "Цена за м³ (UZS)", uz: "1 kub narxi (so'm)" },
        "Sarf (kub)": { en: "Consumption (m³)", ru: "Расход (м³)", uz: "Sarf (kub)" },
        "To'lov turi": { en: "Payment type", ru: "Тип платежа", uz: "To'lov turi" },
        "To'lov tranzaksiya": { en: "Payment transaction", ru: "Платёжная транзакция", uz: "To'lov tranzaksiya" },
        "To'lov tranzaksiyalari": { en: "Payment transactions", ru: "Платёжные транзакции", uz: "To'lov tranzaksiyalari" },
        "Izoh": { en: "Note", ru: "Примечание", uz: "Izoh" },
        "Description": { en: "Description", ru: "Описание", uz: "Izoh" },
        "Tashqi tizim ID (Payme/Click)": { en: "External system ID (Payme/Click)", ru: "ID внешней системы (Payme/Click)", uz: "Tashqi tizim ID (Payme/Click)" },
        "Kim tomonidan": { en: "Created by", ru: "Кем создано", uz: "Kim tomonidan" },
        "Account (Owner ID)": { en: "Account (Owner ID)", ru: "Аккаунт (ID владельца)", uz: "Account (Owner ID)" },
        "Payme dan kelgan xom ma'lumot": { en: "Raw Payme payload", ru: "Сырые данные Payme", uz: "Payme dan kelgan xom ma'lumot" },
        "Qizdirilmagan kunlar": { en: "Excluded heating days", ru: "Дни без отопления", uz: "Qizdirilmagan kunlar" },
        "Ega (vaqt kesimi)": { en: "Owner snapshot", ru: "Владелец на момент расчёта", uz: "Ega (vaqt kesimi)" },
        "Qizdirilgan maydon (m²·kun)": { en: "Heated area (m²·day)", ru: "Отапливаемая площадь (м²·день)", uz: "Qizdirilgan maydon (m²·kun)" },
        "1 m² uchun narx (isitish)": { en: "Heating price per m²", ru: "Цена отопления за м²", uz: "1 m² uchun narx (isitish)" },
        "Isitish summasi (so'm)": { en: "Heating amount (UZS)", ru: "Сумма отопления (UZS)", uz: "Isitish summasi (so'm)" },
        "GVS sarfi (kub)": { en: "Hot water usage (m³)", ru: "Расход ГВС (м³)", uz: "GVS sarfi (kub)" },
        "GVS tarifi (so'm/kub)": { en: "Hot water tariff (UZS/m³)", ru: "Тариф ГВС (UZS/м³)", uz: "GVS tarifi (so'm/kub)" },
        "GVS summasi (so'm)": { en: "Hot water amount (UZS)", ru: "Сумма ГВС (UZS)", uz: "GVS summasi (so'm)" },
        "Jami summa (so'm)": { en: "Total amount (UZS)", ru: "Итого (UZS)", uz: "Jami summa (so'm)" },
        "Qayta hisoblanganmih": { en: "Recalculated", ru: "Пересчитано", uz: "Qayta hisoblanganmih" },
        "Qayta hisoblash vaqti": { en: "Recalculated at", ru: "Время пересчёта", uz: "Qayta hisoblash vaqti" },
        "Umumiy xarajatlar (so'm)": { en: "Total expenses (UZS)", ru: "Общие расходы (UZS)", uz: "Umumiy xarajatlar (so'm)" },
        "Umumiy qizdirilgan maydon": { en: "Total heated area", ru: "Общая отапливаемая площадь", uz: "Umumiy qizdirilgan maydon" },
        "1 m²·kun narxi (so'm)": { en: "Price per m²·day (UZS)", ru: "Цена за м²·день (UZS)", uz: "1 m²·kun narxi (so'm)" },
        "Umumiy GVS sarfi (kub)": { en: "Total hot water usage (m³)", ru: "Общий расход ГВС (м³)", uz: "Umumiy GVS sarfi (kub)" },
        "1 kub tarifi (so'm)": { en: "Tariff per m³ (UZS)", ru: "Тариф за м³ (UZS)", uz: "1 kub tarifi (so'm)" },
        "Severity": { en: "Severity", ru: "Важность", uz: "Muhimlik" },
        "Priority": { en: "Priority", ru: "Приоритет", uz: "Ustuvorlik" },
        "Category": { en: "Category", ru: "Категория", uz: "Kategoriya" },
        "Pinned": { en: "Pinned", ru: "Закреплено", uz: "Qadalgan" },
        "Message": { en: "Message", ru: "Сообщение", uz: "Xabar" },
        "Event at": { en: "Event at", ru: "Время события", uz: "Hodisa vaqti" },
        "Detected at": { en: "Detected at", ru: "Обнаружено", uz: "Aniqlangan vaqt" },
        "Resolved at": { en: "Resolved at", ru: "Решено", uz: "Hal qilingan vaqt" },
        "Assigned to": { en: "Assigned to", ru: "Ответственный", uz: "Biriktirilgan" },
        "Action label": { en: "Action label", ru: "Подпись действия", uz: "Amal nomi" },
        "Scheduled at": { en: "Scheduled at", ru: "Запланировано на", uz: "Rejalashtirilgan vaqt" },
        "Completed at": { en: "Completed at", ru: "Завершено", uz: "Yakunlangan vaqt" },
        "Sort order": { en: "Sort order", ru: "Порядок", uz: "Tartib" },
        "Is active": { en: "Is active", ru: "Активно", uz: "Faol" },
        "Pressure psi": { en: "Pressure PSI", ru: "Давление PSI", uz: "Bosim PSI" },
        "Flow liters day": { en: "Flow L/day", ru: "Поток л/день", uz: "Oqim l/kun" },
        "Uptime percent": { en: "Uptime %", ru: "Аптайм %", uz: "Uptime %" },
        "Updated at": { en: "Updated at", ru: "Обновлено", uz: "Yangilangan vaqt" },
        "Measured at": { en: "Measured at", ru: "Время замера", uz: "O'lchangan vaqt" },
        "Issue state": { en: "Issue state", ru: "Состояние проблемы", uz: "Muammo holati" },
        "Map position": { en: "Map position", ru: "Позиция на карте", uz: "Xarita joylashuvi" },
        "Live telemetry": { en: "Live telemetry", ru: "Живая телеметрия", uz: "Jonli telemetriya" },
        "Metadata": { en: "Metadata", ru: "Метаданные", uz: "Metadata" },

        // Values and statuses
        "connected": { en: "Connected", ru: "Подключён", uz: "Ulangan" },
        "pending": { en: "Pending", ru: "Ожидает", uz: "Kutilmoqda" },
        "Critical": { en: "Critical", ru: "Критично", uz: "Kritik" },
        "Warning": { en: "Warning", ru: "Предупреждение", uz: "Ogohlantirish" },
        "Info": { en: "Info", ru: "Инфо", uz: "Info" },
        "High": { en: "High", ru: "Высокий", uz: "Yuqori" },
        "Medium": { en: "Medium", ru: "Средний", uz: "O'rta" },
        "Low": { en: "Low", ru: "Низкий", uz: "Past" },
        "Online": { en: "Online", ru: "Онлайн", uz: "Onlayn" },
        "Offline": { en: "Offline", ru: "Офлайн", uz: "Oflayn" },
        "Read": { en: "Read", ru: "Прочитано", uz: "O'qilgan" },
        "Unread": { en: "Unread", ru: "Не прочитано", uz: "O'qilmagan" },
        "Archived": { en: "Archived", ru: "Архив", uz: "Arxivlangan" },
        "Open": { en: "Open", ru: "Открыто", uz: "Ochiq" },
        "Resolved": { en: "Resolved", ru: "Решено", uz: "Hal qilingan" },
        "Scheduled": { en: "Scheduled", ru: "Запланировано", uz: "Rejalashtirilgan" },
        "In progress": { en: "In progress", ru: "В работе", uz: "Jarayonda" },
        "Completed": { en: "Completed", ru: "Завершено", uz: "Yakunlandi" },
        "Planned": { en: "Planned", ru: "Запланировано", uz: "Rejalangan" },
        "Pressure": { en: "Pressure", ru: "Давление", uz: "Bosim" },
        "Water": { en: "Water", ru: "Вода", uz: "Suv" },
        "Heating": { en: "Heating", ru: "Отопление", uz: "Isitish" },
        "Payment": { en: "Payment", ru: "Платёж", uz: "To'lov" },
        "Security": { en: "Security", ru: "Безопасность", uz: "Xavfsizlik" },
        "Other": { en: "Other", ru: "Другое", uz: "Boshqa" },
        "Ochiq": { en: "Open", ru: "Открыт", uz: "Ochiq" },
        "Yopiq": { en: "Closed", ru: "Закрыт", uz: "Yopiq" },
        "Isitish": { en: "Heating", ru: "Отопление", uz: "Isitish" },
        "Issiq suv": { en: "Hot water", ru: "ГВС", uz: "Issiq suv" },
        "Naqd pul": { en: "Cash", ru: "Наличные", uz: "Naqd pul" },
        "Qo'lda kiritilgan": { en: "Manual", ru: "Вручную", uz: "Qo'lda kiritilgan" },
        "Hisobdan echish": { en: "Charge", ru: "Начисление", uz: "Hisobdan echish" },
        "Yangi": { en: "New", ru: "Новый", uz: "Yangi" },
        "Tasdiqlandi": { en: "Confirmed", ru: "Подтверждено", uz: "Tasdiqlandi" },
        "Bekor": { en: "Cancelled", ru: "Отменено", uz: "Bekor" },
        "Qaytarildi": { en: "Refunded", ru: "Возвращено", uz: "Qaytarildi" },
        "Ega yo'q": { en: "No owner", ru: "Нет владельца", uz: "Ega yo'q" },

        // Fieldsets
        "Shaxsiy ma'lumot": { en: "Personal data", ru: "Личные данные", uz: "Shaxsiy ma'lumot" },
        "Umumiy ma'lumot": { en: "General data", ru: "Общие данные", uz: "Umumiy ma'lumot" },
        "Sistema": { en: "System", ru: "Система", uz: "Sistema" },
        "Telegram": { en: "Telegram", ru: "Telegram", uz: "Telegram" },
        "To'lov ma'lumoti": { en: "Payment data", ru: "Данные платежа", uz: "To'lov ma'lumoti" },
        "Turar joy majmuasi ichidagi uylar": { en: "Buildings inside the complex", ru: "Дома внутри ЖК", uz: "Turar joy majmuasi ichidagi uylar" },
        "Uyning seksiyalari": { en: "Building sections", ru: "Секции дома", uz: "Uyning seksiyalari" },
    };

    const aliases = new Map();
    const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
    const aliasKey = (value) => normalize(value).toLowerCase();

    Object.entries(catalog).forEach(([key, values]) => {
        aliases.set(aliasKey(key), key);
        Object.values(values).forEach((value) => aliases.set(aliasKey(value), key));
    });

    const selectedLanguage = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return ["en", "ru", "uz"].includes(stored) ? stored : "ru";
    };

    const translateExact = (value, lang = selectedLanguage()) => {
        const text = normalize(value);
        if (!text) return value;
        const canonical = aliases.get(aliasKey(text));
        return canonical ? catalog[canonical][lang] || catalog[canonical].en || text : null;
    };

    const translatePattern = (value, lang = selectedLanguage()) => {
        const text = normalize(value);
        const backDateMatch = text.match(/^([‹<]\s*)(.+)$/);
        if (backDateMatch) {
            const translated = translateExact(backDateMatch[2], lang);
            if (translated) return `${backDateMatch[1]}${translated}`;
        }
        const sortMatch = text.match(/^(.+?)\s*([↑↓↕])$/);
        if (sortMatch) {
            const translated = translateExact(sortMatch[1], lang);
            if (translated) return `${translated} ${sortMatch[2]}`;
        }
        const addMatch = text.match(/^(\+?\s*)?(Добавить|Add|Qo'shish|Qo‘shish)\s+(.+)$/i);
        if (addMatch) {
            const model = translateExact(addMatch[3], lang) || addMatch[3];
            const verb = catalog.Add[lang];
            return `${addMatch[1] || ""}${verb} ${model}`;
        }
        const selectedMatch = text.match(/^(Выбрано|Selected|Tanlandi)\s+(\d+)\s+(из|of|dan)\s+(\d+)$/i);
        if (selectedMatch) {
            if (lang === "en") return `Selected ${selectedMatch[2]} of ${selectedMatch[4]}`;
            if (lang === "uz") return `${selectedMatch[2]} / ${selectedMatch[4]} tanlandi`;
            return `Выбрано ${selectedMatch[2]} из ${selectedMatch[4]}`;
        }
        const selectedSlashMatch = text.match(/^(\d+)\s*\/\s*(\d+)\s+(tanlandi|selected|выбрано)$/i);
        if (selectedSlashMatch) {
            if (lang === "en") return `Selected ${selectedSlashMatch[1]} of ${selectedSlashMatch[2]}`;
            if (lang === "uz") return `${selectedSlashMatch[1]} / ${selectedSlashMatch[2]} tanlandi`;
            return `Выбрано ${selectedSlashMatch[1]} из ${selectedSlashMatch[2]}`;
        }
        const countBuildings = text.match(/^(\d+)\s+(ta uy|домов|buildings)$/i);
        if (countBuildings) {
            if (lang === "en") return `${countBuildings[1]} buildings`;
            if (lang === "uz") return `${countBuildings[1]} ta uy`;
            return `${countBuildings[1]} домов`;
        }
        const countGeneric = text.match(/^(\d+)\s+(ta)$/i);
        if (countGeneric) {
            if (lang === "en") return `${countGeneric[1]} total`;
            if (lang === "ru") return `${countGeneric[1]} шт.`;
            return `${countGeneric[1]} ta`;
        }
        return null;
    };

    const translateValue = (value, lang = selectedLanguage()) => {
        return translateExact(value, lang) || translatePattern(value, lang) || value;
    };

    const initOwnerApartmentFilters = () => {
        const complex = document.getElementById("id_complex_selector");
        const building = document.getElementById("id_building_selector");
        const section = document.getElementById("id_section_selector");
        const apartment = document.getElementById("id_apartment");
        if (!complex || !building || !section || !apartment || apartment.dataset.ownerFiltersBound === "true") return;
        apartment.dataset.ownerFiltersBound = "true";

        const optionMatches = (option, filters) => {
            if (!option.value) return true;
            if (filters.complex && option.dataset.complex !== filters.complex) return false;
            if (filters.building && option.dataset.building !== filters.building) return false;
            if (filters.section && option.dataset.section !== filters.section) return false;
            return true;
        };

        const syncHelperOptions = () => {
            const selectedComplex = complex.value;
            const selectedBuilding = building.value;

            Array.from(building.options).forEach((option) => {
                if (!option.value) return;
                const matches = !selectedComplex || option.textContent.includes(`(${complex.selectedOptions[0]?.textContent || ""})`);
                option.hidden = !matches;
                option.disabled = !matches;
            });
            if (building.selectedOptions[0] && building.selectedOptions[0].disabled) building.value = "";

            Array.from(section.options).forEach((option) => {
                if (!option.value) return;
                const matchesComplex = !selectedComplex || option.textContent.includes(`(${complex.selectedOptions[0]?.textContent || ""})`);
                const matchesBuilding = !selectedBuilding || option.textContent.includes(building.selectedOptions[0]?.textContent || "");
                option.hidden = !(matchesComplex && matchesBuilding);
                option.disabled = !(matchesComplex && matchesBuilding);
            });
            if (section.selectedOptions[0] && section.selectedOptions[0].disabled) section.value = "";
        };

        const syncOptions = () => {
            syncHelperOptions();
            const filters = {
                complex: complex.value,
                building: building.value,
                section: section.value,
            };
            Array.from(apartment.options).forEach((option) => {
                const matches = optionMatches(option, filters);
                option.hidden = !matches;
                option.disabled = !matches;
            });
            if (apartment.selectedOptions[0] && apartment.selectedOptions[0].disabled) {
                apartment.value = "";
                apartment.dispatchEvent(new Event("change", { bubbles: true }));
            }
        };

        [complex, building, section].forEach((select) => select.addEventListener("change", syncOptions));
        syncOptions();
    };

    const shouldSkipNode = (node) => {
        const parent = node.parentElement;
        if (!parent) return true;
        return Boolean(parent.closest("script, style, textarea, pre, code, .admin-lang-switcher, .select2-search, .select2-container, .select2-results, .related-widget-wrapper"));
    };

    const translateTextNode = (node, lang) => {
        if (shouldSkipNode(node)) return;
        const raw = node.nodeValue;
        const translated = translateValue(raw, lang);
        if (translated !== raw && normalize(translated) !== normalize(raw)) {
            const prefix = raw.match(/^\s*/)?.[0] || "";
            const suffix = raw.match(/\s*$/)?.[0] || "";
            node.nodeValue = `${prefix}${translated}${suffix}`;
        }
    };

    const translateAttributes = (root, lang) => {
        root.querySelectorAll("input, textarea, select, option, button, a, label, th, span, div").forEach((element) => {
            if (element.closest(".select2-container, .select2-results, .related-widget-wrapper")) return;
            ["placeholder", "title", "aria-label", "data-original-title"].forEach((attr) => {
                if (!element.hasAttribute(attr)) return;
                const current = element.getAttribute(attr);
                const translated = translateValue(current, lang);
                if (translated !== current) element.setAttribute(attr, translated);
            });
            if ((element.matches("input[type='submit'], input[type='button'], input[type='reset']")) && element.value) {
                const translated = translateValue(element.value, lang);
                if (translated !== element.value) element.value = translated;
            }
        });
    };

    const bindAdminActionSubmit = () => {
        const changelist = document.getElementById("changelist-form");
        if (!changelist || changelist.dataset.actionBound === "true") return;
        changelist.dataset.actionBound = "true";
        changelist.addEventListener("click", (event) => {
            const button = event.target.closest(".actions button, .actions input[type='submit'], .actions input[type='button']");
            if (!button || button.disabled) return;
            event.preventDefault();
            const form = button.form || changelist;
            if (!form) return;
            if (typeof form.requestSubmit === "function") {
                form.requestSubmit(button);
            } else {
                form.submit();
            }
        });
    };

    const translatePage = (lang = selectedLanguage()) => {
        document.documentElement.lang = lang;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        textNodes.forEach((node) => translateTextNode(node, lang));
        translateAttributes(document, lang);
        document.querySelectorAll(".admin-lang-switcher__button").forEach((button) => {
            button.classList.toggle("is-active", button.dataset.adminLang === lang);
            button.setAttribute("aria-pressed", String(button.dataset.adminLang === lang));
        });
    };

    const mountLanguageSwitcher = () => {
        if (document.querySelector(".admin-lang-switcher")) return;
        const navbar = document.querySelector("#jazzy-navbar")
            || document.querySelector(".app-header.navbar")
            || document.querySelector(".main-header.navbar")
            || document.querySelector(".main-header");
        const host = navbar || document.body;
        if (!host) return;

        const wrapper = document.createElement("div");
        wrapper.className = navbar ? "admin-lang-switcher admin-lang-switcher--in-navbar" : "admin-lang-switcher admin-lang-switcher--fallback";
        wrapper.setAttribute("aria-label", "Admin language");
        wrapper.innerHTML = LANGS.map(([code, label]) => (
            `<button class="admin-lang-switcher__button" type="button" data-admin-lang="${code}" aria-pressed="false">${label}</button>`
        )).join("");

        host.appendChild(wrapper);
        wrapper.addEventListener("click", (event) => {
            const button = event.target.closest("[data-admin-lang]");
            if (!button) return;
            localStorage.setItem(STORAGE_KEY, button.dataset.adminLang);
            translatePage(button.dataset.adminLang);
        });
    };

    const boot = () => {
        mountLanguageSwitcher();
        initOwnerApartmentFilters();
        bindAdminActionSubmit();
        translatePage(selectedLanguage());
        if ("MutationObserver" in window) {
            let scheduled = false;
            const observer = new MutationObserver(() => {
                if (scheduled) return;
                scheduled = true;
                window.requestAnimationFrame(() => {
                    scheduled = false;
                    mountLanguageSwitcher();
                    initOwnerApartmentFilters();
                    bindAdminActionSubmit();
                    translatePage(selectedLanguage());
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
