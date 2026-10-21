(() => {
    const root = document.documentElement;
    const storage = window.localStorage;
    const languageOrder = ["en", "ru", "uz"];
    const translations = {
        "Utility Management": { ru: "Коммунальные услуги", uz: "Kommunal boshqaruv" },
        "Dashboard": { ru: "Обзор", uz: "Boshqaruv paneli" },
        "Residents": { ru: "Абоненты", uz: "Abonentlar" },
        "Residential Units": { ru: "Жилые объекты", uz: "Turar joy obyektlari" },
        "Properties": { ru: "Дома", uz: "Uylar" },
        "Billing & Debt": { ru: "Платежи и долги", uz: "To'lovlar va qarzlar" },
        "Payments": { ru: "Платежи и долги", uz: "To'lovlar va qarzlar" },
        "Billing Period": { ru: "Расчётный период", uz: "Hisob davri" },
        "Analytics": { ru: "Аналитика", uz: "Tahlil" },
        "Statistics": { ru: "Статистика", uz: "Statistika" },
        "Reports": { ru: "Отчёты", uz: "Hisobotlar" },
        "Debt reports": { ru: "Отчёты по долгам", uz: "Qarz hisobotlari" },
        "Usage reports": { ru: "Отчёты по потреблению", uz: "Iste'mol hisobotlari" },
        "General overview, debtors list and payment history of the residents.": {
            ru: "Общий обзор, список должников и история платежей абонентов.",
            uz: "Umumiy ko'rinish, qarzdorlar ro'yxati va abonentlar to'lovlari tarixi.",
        },
        "Hot water, heating and payments by house and month.": {
            ru: "ГВС, отопление и платежи по домам и месяцам.",
            uz: "Issiq suv, isitish va to'lovlar uylar va oylar bo'yicha.",
        },
        "Billing period workbooks": { ru: "Файлы расчётных периодов", uz: "Hisob davri fayllari" },
        "Each billing period downloads as an Excel file: a heating and a hot water sheet per house.": {
            ru: "Каждый расчётный период выгружается в Excel: листы отопления и ГВС по каждому дому.",
            uz: "Har bir hisob davri Excel faylga yuklanadi: har uy uchun isitish va issiq suv listlari.",
        },
        "Create report": { ru: "Сформировать отчёт", uz: "Hisobot yaratish" },
        "Open billing periods": { ru: "Открыть расчётные периоды", uz: "Hisob davrlarini ochish" },
        "Settings": { ru: "Настройки", uz: "Sozlamalar" },
        "Recent requests": { ru: "Недавние запросы", uz: "So'nggi so'rovlar" },
        "No results": { ru: "Ничего не найдено", uz: "Natija topilmadi" },
        "Loading profile": { ru: "Загрузка профиля", uz: "Profil yuklanmoqda" },
        "Admin User": { ru: "Администратор", uz: "Administrator" },
        "Administrator": { ru: "Администратор", uz: "Administrator" },
        "Staff": { ru: "Сотрудник", uz: "Xodim" },
        "Operator": { ru: "Оператор", uz: "Operator" },
        "Profile": { ru: "Профиль", uz: "Profil" },
        "Logs": { ru: "Логи", uz: "Loglar" },
        "Action history": { ru: "История действий", uz: "Amallar tarixi" },
        "Preferences": { ru: "Предпочтения", uz: "Afzalliklar" },
        "Organization settings": { ru: "Настройки организации", uz: "Tashkilot sozlamalari" },
        "Audit log": { ru: "Журнал аудита", uz: "Audit jurnali" },
        "Live backend activity trail synced from Django admin and portal actions.": { ru: "Живая лента действий из Django admin и портала.", uz: "Django admin va portaldagi amallar jonli jurnali." },
        "Total events": { ru: "Всего событий", uz: "Jami hodisalar" },
        "Visible": { ru: "Показано", uz: "Ko'rinmoqda" },
        "Search audit events...": { ru: "Поиск событий аудита...", uz: "Audit hodisalarini qidirish..." },
        "Add audit note": { ru: "Добавить заметку", uz: "Izoh qo'shish" },
        "Copy latest": { ru: "Копировать последнее", uz: "Oxirgisini nusxalash" },
        "Copy": { ru: "Скопировать", uz: "Nusxalash" },
        "Copied": { ru: "Скопировано", uz: "Nusxalandi" },
        "Export log": { ru: "Экспорт журнала", uz: "Jurnal eksporti" },
        "No audit events found": { ru: "События аудита не найдены", uz: "Audit hodisalari topilmadi" },
        "Clear search or switch the event type.": { ru: "Очистите поиск или смените тип события.", uz: "Qidiruvni tozalang yoki hodisa turini almashtiring." },
        "Audit note added": { ru: "Заметка аудита добавлена", uz: "Audit izohi qo'shildi" },
        "Latest audit event copied": { ru: "Последнее событие скопировано", uz: "Oxirgi hodisa nusxalandi" },
        "Latest audit event ready": { ru: "Последнее событие готово", uz: "Oxirgi hodisa tayyor" },
        "Audit log exported": { ru: "Журнал аудита экспортирован", uz: "Audit jurnali eksport qilindi" },
        "Audit export failed": { ru: "Экспорт аудита не выполнен", uz: "Audit eksporti bajarilmadi" },
        "No audit rows to export": { ru: "Нет строк аудита для экспорта", uz: "Eksport uchun audit qatorlari yo'q" },
        "Audit ID": { ru: "ID аудита", uz: "Audit ID" },
        "Date and time": { ru: "Дата и время", uz: "Sana va vaqt" },
        "Event type": { ru: "Тип события", uz: "Hodisa turi" },
        "Title": { ru: "Заголовок", uz: "Sarlavha" },
        "Message": { ru: "Сообщение", uz: "Xabar" },
        "Actor": { ru: "Исполнитель", uz: "Ijrochi" },
        "Sector": { ru: "Сектор", uz: "Sektor" },
        "House": { ru: "Дом", uz: "Uy" },
        "Apartment": { ru: "Квартира", uz: "Xonadon" },
        "Resident": { ru: "Абонент", uz: "Abonent" },
        "Admin link": { ru: "Ссылка admin", uz: "Admin havolasi" },
        "Sign out": { ru: "Выйти", uz: "Chiqish" },
        "Account, role and access": { ru: "Аккаунт, роль и доступ", uz: "Akkaunt, rol va ruxsat" },
        "Display, language and theme": { ru: "Вид, язык и тема", uz: "Ko'rinish, til va mavzu" },
        "Workspace and permissions": { ru: "Рабочая область и права", uz: "Ish maydoni va ruxsatlar" },
        "Activity and security trail": { ru: "Действия и безопасность", uz: "Faoliyat va xavfsizlik tarixi" },
        "End local session": { ru: "Завершить локальную сессию", uz: "Mahalliy sessiyani tugatish" },
        "Workspace profile": { ru: "Профиль рабочей области", uz: "Ish maydoni profili" },
        "Active": { ru: "Активен", uz: "Faol" },
        "Workspace": { ru: "Рабочая область", uz: "Ish maydoni" },
        "Time zone": { ru: "Часовой пояс", uz: "Vaqt mintaqasi" },
        "Last active": { ru: "Последняя активность", uz: "Oxirgi faollik" },
        "Profile details": { ru: "Данные профиля", uz: "Profil tafsilotlari" },
        "Personal data": { ru: "Личные данные", uz: "Shaxsiy ma'lumotlar" },
        "Access and permissions": { ru: "Доступ и права", uz: "Ruxsat va huquqlar" },
        "Dates and session": { ru: "Даты и сессия", uz: "Sana va sessiya" },
        "Full name": { ru: "ФИО", uz: "FIO" },
        "Username": { ru: "Логин", uz: "Login" },
        "Django user ID": { ru: "Django user ID", uz: "Django user ID" },
        "Email": { ru: "Email", uz: "Email" },
        "Role": { ru: "Роль", uz: "Rol" },
        "Organization": { ru: "Организация", uz: "Tashkilot" },
        "Access level": { ru: "Уровень доступа", uz: "Ruxsat darajasi" },
        "Full operations access": { ru: "Полный операционный доступ", uz: "To'liq operatsion ruxsat" },
        "Staff access": { ru: "Staff доступ", uz: "Staff ruxsati" },
        "Staff account": { ru: "Staff доступ", uz: "Staff ruxsati" },
        "Superuser": { ru: "Суперпользователь", uz: "Superuser" },
        "Account active": { ru: "Аккаунт активен", uz: "Akkaunt faol" },
        "Groups": { ru: "Группы", uz: "Guruhlar" },
        "Permissions": { ru: "Права", uz: "Ruxsatlar" },
        "Last login": { ru: "Последний вход", uz: "Oxirgi kirish" },
        "Joined": { ru: "Создан", uz: "Yaratilgan" },
        "Profile updated": { ru: "Профиль обновлён", uz: "Profil yangilangan" },
        "Backend source": { ru: "Источник backend", uz: "Backend manbasi" },
        "Not set": { ru: "Не указано", uz: "Kiritilmagan" },
        "No groups": { ru: "Без групп", uz: "Guruhsiz" },
        "Yes": { ru: "Да", uz: "Ha" },
        "No": { ru: "Нет", uz: "Yo'q" },
        "Security": { ru: "Безопасность", uz: "Xavfsizlik" },
        "Two-factor authentication": { ru: "Двухфакторная аутентификация", uz: "Ikki faktorli autentifikatsiya" },
        "Enabled": { ru: "Включено", uz: "Yoqilgan" },
        "Disabled": { ru: "Отключено", uz: "O'chirilgan" },
        "Session status": { ru: "Статус сессии", uz: "Sessiya holati" },
        "Django User": { ru: "Django user", uz: "Django user" },
        "Django User + WorkspaceProfile": { ru: "Django user + WorkspaceProfile", uz: "Django user + WorkspaceProfile" },
        "This profile preview is local until the backend admin panel is connected.": { ru: "Профиль пока локальный, пока не подключена backend admin panel.", uz: "Backend admin panel ulanmaguncha profil mahalliy ko'rinishda." },
        "Edit profile": { ru: "Редактировать профиль", uz: "Profilni tahrirlash" },
        "Profile update queued": { ru: "Обновление профиля поставлено в очередь", uz: "Profil yangilanishi navbatga qo'yildi" },
        "Sign out unavailable": { ru: "Выход пока недоступен", uz: "Chiqish hozircha mavjud emas" },
        "Notifications": { ru: "Уведомления", uz: "Bildirishnomalar" },
        "To do": { ru: "Задачи", uz: "Vazifalar" },
        "Resolved tasks": { ru: "Закрытые", uz: "Yopilgan" },
        "Resolved by": { ru: "Решил", uz: "Hal qilgan" },
        "Unknown admin": { ru: "Неизвестный админ", uz: "Noma'lum admin" },
        "No resolved tasks yet": { ru: "Пока нет решённых задач", uz: "Hali hal qilingan vazifalar yo'q" },
        "Unread operational events and assigned actions.": { ru: "Непрочитанные события и назначенные действия.", uz: "O'qilmagan hodisalar va tayinlangan amallar." },
        "3 unread": { ru: "3 непрочитанных", uz: "3 ta o'qilmagan" },
        "Critical": { ru: "Критично", uz: "Jiddiy" },
        "Warning": { ru: "Предупреждение", uz: "Ogohlantirish" },
        "Info": { ru: "Информация", uz: "Ma'lumot" },
        "Pressure drop detected": { ru: "Обнаружено падение давления", uz: "Bosim pasayishi aniqlandi" },
        "Assign technician": { ru: "Назначить техника", uz: "Texnik tayinlash" },
        "Details": { ru: "Детали", uz: "Tafsilotlar" },
        "Open schedule": { ru: "Открыть график", uz: "Jadvalni ochish" },
        "Mute": { ru: "Отключить", uz: "O'chirish" },
        "Review batch": { ru: "Проверить пакет", uz: "Paketni tekshirish" },
        "Archive": { ru: "Архив", uz: "Arxiv" },
        "Pinned": { ru: "Закреплено", uz: "Mahkamlangan" },
        "Pin": { ru: "PIN", uz: "PIN" },
        "Today": { ru: "Сегодня", uz: "Bugun" },
        "Yesterday": { ru: "Вчера", uz: "Kecha" },
        "Older": { ru: "Ранее", uz: "Oldingi" },
        "Reminder for": { ru: "Напоминание для", uz: "Eslatma" },
        "Outstanding balance reminder for apartment": { ru: "Напоминание о задолженности по квартире", uz: "Xonadon bo'yicha qarz eslatmasi" },
        "Assigned to": { ru: "Назначено", uz: "Biriktirilgan" },
        "Review owner": { ru: "Проверить абонента", uz: "Abonentni tekshirish" },
        "Resident follow-up:": { ru: "Сопровождение резидента:", uz: "Abonent bo'yicha kuzatuv:" },
        "Mark done": { ru: "Выполнить", uz: "Bajarildi" },
        "Reopen": { ru: "Вернуть", uz: "Qaytarish" },
        "Tasks left": { ru: "задач осталось", uz: "vazifa qoldi" },
        "Shared To Do": { ru: "Общие задачи", uz: "Umumiy vazifalar" },
        "No hidden alerts": { ru: "Скрытых уведомлений нет", uz: "Yashirin ogohlantirishlar yo'q" },
        "Resolved notifications are moved to the activity log.": { ru: "Закрытые уведомления перемещаются в журнал действий.", uz: "Yopilgan bildirishnomalar faoliyat jurnaliga ko'chiriladi." },
        "Filters": { ru: "Фильтры", uz: "Filtrlar" },
        "Static preview filters. Backend wiring can replace these later.": { ru: "Демо-фильтры. Позже их можно подключить к backend.", uz: "Demo filtrlar. Keyin backendga ulash mumkin." },
        "Filters apply to the current backend data set and saved view state.": { ru: "Фильтры применяются к текущим backend-данным и сохранённому состоянию вида.", uz: "Filtrlar joriy backend ma'lumotlari va saqlangan ko'rinish holatiga qo'llanadi." },
        "District": { ru: "Район", uz: "Hudud" },
        "Status": { ru: "Статус", uz: "Holat" },
        "Period": { ru: "Период", uz: "Davr" },
        "Selected filters": { ru: "Выбранные фильтры", uz: "Tanlangan filtrlar" },
        "Reset filters": { ru: "Сбросить", uz: "Tozalash" },
        "Apply filters": { ru: "Применить", uz: "Qo'llash" },
        "No objects match these filters": { ru: "Нет объектов по этим фильтрам", uz: "Bu filtrlarga mos obyektlar yo'q" },
        "Change district, status or period to restore data.": { ru: "Измените район, статус или период, чтобы вернуть данные.", uz: "Ma'lumotlarni qaytarish uchun tuman, holat yoki davrni o'zgartiring." },
        "Change status or period to restore data.": { ru: "Измените статус или период, чтобы вернуть данные.", uz: "Ma'lumotlarni qaytarish uchun holat yoki davrni o'zgartiring." },
        "All Districts": { ru: "Все районы", uz: "Barcha tumanlar" },
        "North Sector": { ru: "Северный сектор", uz: "Shimoliy sektor" },
        "Harbor District": { ru: "Портовый район", uz: "Harbor tumani" },
        "South Ridge": { ru: "Южный хребет", uz: "Janubiy Ridge" },
        "West Valley": { ru: "Западная долина", uz: "G'arbiy vodiy" },
        "Central District": { ru: "Центральный район", uz: "Markaziy tuman" },
        "All statuses": { ru: "Все статусы", uz: "Barcha holatlar" },
        "Low Risk": { ru: "Низкий риск", uz: "Past xavf" },
        "Medium Risk": { ru: "Средний риск", uz: "O'rta xavf" },
        "Debtors": { ru: "Должники", uz: "Qarzdorlar" },
        "Maintenance": { ru: "Обслуживание", uz: "Texnik xizmat" },
        "Operational": { ru: "Работает", uz: "Ishlamoqda" },
        "Last 90 days": { ru: "Последние 90 дней", uz: "So'nggi 90 kun" },
        "Last 30 days": { ru: "Последние 30 дней", uz: "So'nggi 30 kun" },
        "Current month": { ru: "Текущий месяц", uz: "Joriy oy" },
        "All time": { ru: "Всё время", uz: "Butun davr" },
        "Recent payments": { ru: "Последние платежи", uz: "So'nggi to'lovlar" },
        "System alerts": { ru: "Системные уведомления", uz: "Tizim ogohlantirishlari" },
        "Debt": { ru: "Долг", uz: "Qarz" },
        "Last payment": { ru: "Последний платеж", uz: "Oxirgi to'lov" },
        "System health": { ru: "Состояние системы", uz: "Tizim holati" },
        "Send reminder": { ru: "Отправить напоминание", uz: "Eslatma yuborish" },
        "Export": { ru: "Экспорт", uz: "Eksport" },
        "Export report": { ru: "Экспорт отчёта", uz: "Hisobot eksporti" },
        "Send reminders": { ru: "Отправить напоминания", uz: "Eslatmalar yuborish" },
        "Assign status": { ru: "Назначить статус", uz: "Holat belgilash" },
        "Previous": { ru: "Назад", uz: "Oldingi" },
        "Next": { ru: "Далее", uz: "Keyingi" },
        "No filters": { ru: "Фильтров нет", uz: "Filtrlar yo'q" },
        "All homes connected": { ru: "Все дома подключены", uz: "Barcha uylar ulangan" },
        "All": { ru: "Все", uz: "Hammasi" },
        "Close alert": { ru: "Закрыть alert", uz: "Alertni yopish" },
        "Confirm action": { ru: "Подтвердите действие", uz: "Amalni tasdiqlang" },
        "Confirm": { ru: "Подтвердить", uz: "Tasdiqlash" },
        "This action changes the current workspace state.": { ru: "Это действие изменит текущее состояние рабочего пространства.", uz: "Bu amal joriy ish maydoni holatini o'zgartiradi." },
        "Interface density": { ru: "Плотность интерфейса", uz: "Interfeys zichligi" },
        "Comfortable": { ru: "Свободно", uz: "Qulay" },
        "Compact": { ru: "Компактно", uz: "Ixcham" },
        "Owner": { ru: "Ответственный", uz: "Mas'ul" },
        "Technician": { ru: "Техник", uz: "Texnik" },
        "SLA": { ru: "SLA", uz: "SLA" },
        "Outstanding balance": { ru: "Текущий долг", uz: "Joriy qarz" },
        "Last payment": { ru: "Последний платёж", uz: "Oxirgi to'lov" },
        "health": { ru: "здоровье", uz: "holat" },
        "Operations Team": { ru: "Операционная команда", uz: "Operatsion jamoa" },
        "No admins found": { ru: "Админы не найдены", uz: "Adminlar topilmadi" },
        "Unassigned": { ru: "Не назначен", uz: "Belgilanmagan" },
        "Activity timeline": { ru: "Лента активности", uz: "Faoliyat tarixi" },
        "Close critical alert": { ru: "Закрыть критичный alert", uz: "Jiddiy alertni yopish" },
        "Reset filters?": { ru: "Сбросить фильтры?", uz: "Filtrlarni tozalaysizmi?" },
        "Close this critical alert?": { ru: "Закрыть это критичное уведомление?", uz: "Bu jiddiy ogohlantirish yopilsinmi?" },
        "Alert closed": { ru: "Уведомление закрыто", uz: "Ogohlantirish yopildi" },
        "Density updated": { ru: "Плотность обновлена", uz: "Zichlik yangilandi" },
        "Overview": { ru: "Обзор", uz: "Umumiy ko'rinish" },
        "Real-time infrastructure monitoring for North Sector.": { ru: "Мониторинг инфраструктуры Северного сектора в реальном времени.", uz: "Shimoliy sektor infratuzilmasi real vaqt monitoringi." },
        "Last check: 2m ago": { ru: "Последняя проверка: 2 мин назад", uz: "Oxirgi tekshiruv: 2 daqiqa oldin" },
        "Total Revenue": { ru: "Общая выручка", uz: "Jami tushum" },
        "Total Residents": { ru: "Всего резидентов", uz: "Jami rezidentlar" },
        "Paid Residents": { ru: "Оплатили", uz: "To'laganlar" },
        "Total Debtors": { ru: "Всего должников", uz: "Jami qarzdorlar" },
        "Total linked resident profiles": { ru: "Всего привязанных профилей резидентов", uz: "Jami ulangan rezident profillari" },
        "Total apartments in system": { ru: "Всего квартир в системе", uz: "Tizimdagi jami kvartiralar" },
        "Critical Debt Units": { ru: "Должники", uz: "Qarzdorlar" },
        "Residents with positive or zero balance": { ru: "Резиденты с положительным или нулевым балансом", uz: "Musbat yoki nol balansli rezidentlar" },
        "Residents with overdue balance": { ru: "Резиденты с просроченным балансом", uz: "Muddati o'tgan balansli rezidentlar" },
        "Current resident liabilities": { ru: "Текущие обязательства резидентов", uz: "Rezidentlarning joriy majburiyatlari" },
        "Resident Directory": { ru: "Каталог резидентов", uz: "Rezidentlar katalogi" },
        "Name": { ru: "Имя", uz: "Ism" },
        "ID": { ru: "ID", uz: "ID" },
        "House overview": { ru: "Сводка по дому", uz: "Uy bo'yicha ko'rinish" },
        "House name": { ru: "Название дома", uz: "Uy nomi" },
        "Total area": { ru: "Общая площадь", uz: "Umumiy maydon" },
        "Apartments and residents": { ru: "Квартиры и абоненты", uz: "Kvartiralar va abonentlar" },
        "Non-debtors": { ru: "Не должники", uz: "Qarzdor emaslar" },
        "Periods list": { ru: "Список периодов", uz: "Davrlar ro'yxati" },
        "Residential building summary from backend data.": { ru: "Сводка по дому из реальных backend-данных.", uz: "Uy bo'yicha haqiqiy backend ma'lumotlari." },
        "Actions": { ru: "Действия", uz: "Amallar" },
        "Reset": { ru: "Сбросить", uz: "Tozalash" },
        "Adjust filters to show matching resident profiles.": { ru: "Измените фильтры, чтобы показать подходящие профили резидентов.", uz: "Mos rezident profillarini ko'rsatish uchun filtrlarni o'zgartiring." },
        "Linked resident profiles with contact, apartment and Telegram sync details.": { ru: "Привязанные профили резидентов с контактами, квартирой и Telegram-статусом.", uz: "Kontakt, kvartira va Telegram holati bilan ulangan rezident profillari." },
        "Telegram": { ru: "Telegram", uz: "Telegram" },
        "Connected": { ru: "Подключён", uz: "Ulangan" },
        "Pending": { ru: "Ожидает", uz: "Kutilmoqda" },
        "Not linked": { ru: "Не подключён", uz: "Ulanmagan" },
        // Telegram status of a resident ("Connected" is also the portal's backend status, "Подключено").
        "Linked": { ru: "Подключён", uz: "Ulangan" },
        "Review": { ru: "Проверка", uz: "Tekshiruv" },
        "True": { ru: "Есть", uz: "Bor" },
        "False": { ru: "Нет", uz: "Yo'q" },
        "No residents found": { ru: "Резиденты не найдены", uz: "Rezidentlar topilmadi" },
        "Adjust search or filters to show matching resident profiles.": { ru: "Измените поиск или фильтры, чтобы показать подходящие профили.", uz: "Mos profillarni ko'rsatish uchun qidiruv yoki filtrlarni o'zgartiring." },
        "Contract": { ru: "Договор", uz: "Shartnoma" },
        "Resident since": { ru: "Резидент с", uz: "Rezident sanasi" },
        "Telegram user": { ru: "Телеграм", uz: "Telegram" },
        "Section": { ru: "Секция", uz: "Seksiya" },
        "Current Balance": { ru: "Текущий баланс", uz: "Joriy balans" },
        "FIO": { ru: "ФИО", uz: "F.I.Sh." },
        "Payment method": { ru: "Чем оплата", uz: "To'lov turi" },
        "No debt": { ru: "Не долг", uz: "Qarz yo'q" },
        "Total Complexes": { ru: "Всего домов", uz: "Jami uylar" },
        "Active Buildings": { ru: "Квартиры", uz: "Kvartiralar" },
        "Occupancy Rate": { ru: "Жильцы", uz: "Abonentlar" },
        "Critical Debt Units": { ru: "Должники", uz: "Qarzdorlar" },
        "Active Subscribers": { ru: "Активные абоненты", uz: "Faol abonentlar" },
        "new this month": { ru: "новых за месяц", uz: "bu oy yangi" },
        "Consumption Rate": { ru: "Потребление", uz: "Iste'mol darajasi" },
        "Efficient flow across 8 complexes": { ru: "Стабильный поток по 8 домам", uz: "8 uy bo'ylab barqaror oqim" },
        "Outstanding Debt": { ru: "Текущая задолженность", uz: "Joriy qarzdorlik" },
        "Requires Action": { ru: "Требует действия", uz: "Amal talab qiladi" },
        "Consumption Trends": { ru: "Динамика потребления", uz: "Iste'mol dinamikasi" },
        "Seasonal water vs. heating throughput (FY24)": { ru: "Сезонная динамика воды и отопления (FY24)", uz: "Suv va isitish bo'yicha mavsumiy o'tkazuvchanlik (FY24)" },
        "Water": { ru: "Вода", uz: "Suv" },
        "Heating": { ru: "Отопление", uz: "Isitish" },
        "Complex Status Health Scores": { ru: "Индекс состояния домов", uz: "Uylar holati indeksi" },
        "Optimal": { ru: "Оптимально", uz: "Optimal" },
        "Leak Alert": { ru: "Утечка", uz: "Oqish signali" },
        "Central District": { ru: "Центральный район", uz: "Markaziy tuman" },
        "Maintenance Pending": { ru: "Ожидает обслуживания", uz: "Xizmat kutilmoqda" },
        "Quick Actions": { ru: "Быстрые действия", uz: "Tezkor amallar" },
        "Generate Usage Report": { ru: "Сформировать отчёт потребления", uz: "Iste'mol hisobotini yaratish" },
        "Add New Resident Profile": { ru: "Добавить профиль жильца", uz: "Yangi yashovchi profilini qo'shish" },
        "Generate Billing Notice": { ru: "Сформировать уведомление", uz: "To'lov xabarnomasini yaratish" },
        "Create Billing Notice": { ru: "Создать уведомление", uz: "Xabarnoma yaratish" },
        "Find a resident, confirm the profile and create a payment.": { ru: "Найдите абонента, проверьте профиль и создайте платёж.", uz: "Abonentni toping, profilni tasdiqlang va to'lov yarating." },
        "Adjust the query to find a resident.": { ru: "Измените запрос, чтобы найти абонента.", uz: "Abonentni topish uchun so'rovni o'zgartiring." },
        "Resident payment profile": { ru: "Платёжный профиль абонента", uz: "Abonentning to'lov profili" },
        "Amount": { ru: "Сумма", uz: "Summa" },
        "Balance": { ru: "Баланс", uz: "Balans" },
        "Billing": { ru: "Биллинг", uz: "Billing" },
        "Payment: Click / Payme": { ru: "Оплата: Click / Payme", uz: "To'lov: Click / Payme" },
        "Payment: operator": { ru: "Оплата через оператора", uz: "To'lov: operator orqali" },
        "Balance change": { ru: "Изменение баланса", uz: "Balans o'zgarishi" },
        "Billing period: edited": { ru: "Расчётный период: изменён", uz: "Hisob davri: tahrirlandi" },
        "Billing period: closed / opened": { ru: "Расчётный период: закрыт / открыт", uz: "Hisob davri: yopildi / ochildi" },
        "All operators": { ru: "Все операторы", uz: "Barcha operatorlar" },
        "Who did what: payments, balance changes, billing periods and Telegram links.": { ru: "Кто что сделал: платежи, изменения баланса, расчётные периоды и подключения Telegram.", uz: "Kim nima qildi: to'lovlar, balans o'zgarishlari, hisob davrlari va Telegram ulanishlari." },
        "Operation": { ru: "Операция", uz: "Amal" },
        "Add funds": { ru: "Зачислить", uz: "Hisobga kiritish" },
        "Credit": { ru: "Зачислить", uz: "Hisobga kiritish" },
        "Subtract": { ru: "Вычесть", uz: "Ayrish" },
        "Channel": { ru: "Канал", uz: "Kanal" },
        "Cash": { ru: "Наличные", uz: "Naqd" },
        "Terminal": { ru: "Терминал", uz: "Terminal" },
        "Card": { ru: "Карта", uz: "Karta" },
        "Card (terminal)": { ru: "Карта (терминал)", uz: "Karta (terminal)" },
        "Payment type": { ru: "Тип оплаты", uz: "To'lov turi" },
        "Username not found": { ru: "Не найден", uz: "Topilmadi" },
        "Pay": { ru: "Оплата", uz: "To'lov" },
        "Download PDF": { ru: "Скачать PDF", uz: "PDF yuklab olish" },
        "Preparing notice...": { ru: "Готовим уведомление...", uz: "Xabarnoma tayyorlanmoqda..." },
        "Could not prepare the notice.": { ru: "Не удалось подготовить уведомление.", uz: "Xabarnomani tayyorlab bo'lmadi." },
        "Notice downloaded": { ru: "Уведомление скачано", uz: "Xabarnoma yuklab olindi" },
        "The payment notice was saved as PDF.": { ru: "Платёжное уведомление сохранено в PDF.", uz: "To'lov xabarnomasi PDF ko'rinishida saqlandi." },
        "Notice not created": { ru: "Уведомление не создано", uz: "Xabarnoma yaratilmadi" },
        "House / apartment": { ru: "Дом / кв.", uz: "Uy / xonadon" },
        "System": { ru: "Система", uz: "Tizim" },
        "Charge": { ru: "Начисление", uz: "Hisoblash" },
        "Card transfer": { ru: "Перевод на карту", uz: "Kartaga o'tkazma" },
        "Card transfer payment synced with backend.": { ru: "Платёж переводом на карту синхронизирован с backend.", uz: "Kartaga o'tkazma to'lovi backend bilan sinxronlandi." },
        "Save payment": { ru: "Сохранить платёж", uz: "To'lovni saqlash" },
        "Payment will be saved and balances will refresh from backend data.": { ru: "Платёж будет сохранён, после чего балансы обновятся из backend-данных.", uz: "To'lov saqlanadi va keyin balanslar backend ma'lumotlaridan yangilanadi." },
        "Select a resident": { ru: "Выберите абонента", uz: "Abonentni tanlang" },
        "Choose a resident on the left to prepare a real payment operation.": { ru: "Выберите абонента слева, чтобы подготовить реальную платёжную операцию.", uz: "Haqiqiy to'lov amalini tayyorlash uchun chapdan abonentni tanlang." },
        "Search by name, phone, Telegram, house, apartment or personal account...": { ru: "Поиск по имени, телефону, Telegram, дому, квартире или лицевому счёту...", uz: "Ism, telefon, Telegram, uy, kvartira yoki abonent raqami bo'yicha qidirish..." },
        "Search by name, phone, house, apartment or personal account...": { ru: "Поиск по имени, телефону, дому, квартире или лицевому счёту...", uz: "Ism, telefon, uy, kvartira yoki abonent raqami bo'yicha qidirish..." },
        "Syncing backend data...": { ru: "Синхронизация backend-данных...", uz: "Backend ma'lumotlari sinxronlanmoqda..." },
        "Saving payment...": { ru: "Сохранение платежа...", uz: "To'lov saqlanmoqda..." },
        "Resident ID could not be resolved.": { ru: "Не удалось определить ID абонента.", uz: "Abonent ID aniqlanmadi." },
        "Amount must be greater than zero.": { ru: "Сумма должна быть больше нуля.", uz: "Summa noldan katta bo'lishi kerak." },
        "Balance subtraction will be saved and totals will refresh from backend data.": { ru: "Списание будет сохранено, после чего суммы обновятся из backend-данных.", uz: "Ayirma saqlanadi va keyin summalar backend ma'lumotlaridan yangilanadi." },
        "Payment saved": { ru: "Платёж сохранён", uz: "To'lov saqlandi" },
        "Balance updated": { ru: "Баланс обновлён", uz: "Balans yangilandi" },
        "Cash payment synced with backend.": { ru: "Платёж наличными синхронизирован с backend.", uz: "Naqd to'lov backend bilan sinxronlandi." },
        "Terminal payment synced with backend.": { ru: "Платёж через терминал синхронизирован с backend.", uz: "Terminal to'lovi backend bilan sinxronlandi." },
        "Card payment synced with backend.": { ru: "Платёж картой синхронизирован с backend.", uz: "Karta orqali to'lov backend bilan sinxronlandi." },
        "Manual subtraction synced with backend.": { ru: "Ручное списание синхронизировано с backend.", uz: "Qo'lda ayirma backend bilan sinxronlandi." },
        "Billing notice": { ru: "Платёжное уведомление", uz: "To'lov xabarnomasi" },
        "Preview of the resident debt notice generated from current backend data.": { ru: "Предпросмотр уведомления о долге, собранного из текущих backend-данных.", uz: "Joriy backend ma'lumotlaridan yig'ilgan qarzdorlik xabarnomasi ko'rinishi." },
        "Select a resident, review the notice, then download it as PDF or send it in Telegram.": { ru: "Выберите абонента, проверьте уведомление, затем скачайте его в PDF или отправьте в Telegram.", uz: "Abonentni tanlang, xabarnomani tekshiring, so'ng uni PDF qilib yuklab oling yoki Telegramga yuboring." },
        "Create Billing Period": { ru: "Создать расчётный период", uz: "Hisob davrini yaratish" },
        "Create a new расчетный период for heating and hot water calculations.": { ru: "Создать новый расчётный период для отопления и горячей воды.", uz: "Isitish va issiq suv hisoblari uchun yangi hisob davrini yarating." },
        "Open admin form": { ru: "Открыть admin форму", uz: "Admin formasini ochish" },
        "Back to Billing": { ru: "Назад к биллингу", uz: "Billing sahifasiga qaytish" },
        "Search residents...": { ru: "Поиск абонентов...", uz: "Abonentlarni qidirish..." },
        "Debtors": { ru: "Должники", uz: "Qarzdorlar" },
        "Choose a resident to preview the billing notice.": { ru: "Выберите резидента, чтобы увидеть платёжное уведомление.", uz: "To'lov xabarnomasini ko'rish uchun rezidentni tanlang." },
        "Balance order": { ru: "Порядок баланса", uz: "Balans tartibi" },
        "Largest debt": { ru: "Макс. долг", uz: "Eng katta qarz" },
        "Smallest debt": { ru: "Мин. долг", uz: "Eng kichik qarz" },
        "Largest first": { ru: "Сначала большой", uz: "Katta qarz avval" },
        "Smallest first": { ru: "Сначала малый", uz: "Kichik qarz avval" },
        "shown": { ru: "показано", uz: "ko'rsatildi" },
        "Loading residents...": { ru: "Загрузка абонентов...", uz: "Abonentlar yuklanmoqda..." },
        "No residents found": { ru: "Абоненты не найдены", uz: "Abonentlar topilmadi" },
        "Adjust search or filters to find a resident.": { ru: "Измените поиск или фильтр, чтобы найти абонента.", uz: "Abonentni topish uchun qidiruv yoki filtrni o'zgartiring." },
        "Copy notice": { ru: "Скопировать уведомление", uz: "Xabarnomani nusxalash" },
        "Notify in Telegram": { ru: "Уведомить в Telegram", uz: "Telegramda xabardor qilish" },
        "Billing notice copied": { ru: "Уведомление скопировано", uz: "Xabarnoma nusxalandi" },
        "Notice text was copied to clipboard.": { ru: "Текст уведомления скопирован в буфер обмена.", uz: "Xabarnoma matni almashish buferiga nusxalandi." },
        "Copy failed": { ru: "Не удалось скопировать", uz: "Nusxalab bo'lmadi" },
        "Could not copy notice text.": { ru: "Не удалось скопировать текст уведомления.", uz: "Xabarnoma matnini nusxalab bo'lmadi." },
        "Telegram connected": { ru: "Telegram подключён", uz: "Telegram ulangan" },
        "Sent to Telegram": { ru: "Отправлено в Telegram", uz: "Telegramga yuborildi" },
        "The debt notice was sent to the resident in Telegram.": { ru: "Уведомление о долге отправлено резиденту в Telegram.", uz: "Qarz haqidagi xabarnoma rezidentga Telegramda yuborildi." },
        "Not sent": { ru: "Не отправлено", uz: "Yuborilmadi" },
        "The resident is not connected to Telegram.": { ru: "Резидент не подключён к Telegram.", uz: "Rezident Telegramga ulanmagan." },
        "The resident has no debt.": { ru: "У резидента нет долга.", uz: "Rezidentning qarzi yo'q." },
        "Could not send the notice.": { ru: "Не удалось отправить уведомление.", uz: "Xabarnomani yuborib bo'lmadi." },
        "Resident was not found.": { ru: "Резидент не найден.", uz: "Rezident topilmadi." },
        "The Telegram bot is not configured (TELEGRAM_BOT_TOKEN).": { ru: "Telegram-бот не настроен (TELEGRAM_BOT_TOKEN).", uz: "Telegram-bot sozlanmagan (TELEGRAM_BOT_TOKEN)." },
        "The resident has blocked the bot, so Telegram did not deliver the notice.": { ru: "Резидент заблокировал бота, поэтому Telegram не доставил уведомление.", uz: "Rezident botni bloklagan, shuning uchun Telegram xabarnomani yetkazmadi." },
        "Close": { ru: "Закрыть", uz: "Yopish" },
        "Add district": { ru: "Добавить район", uz: "Hudud qo'shish" },
        "Add house": { ru: "Добавить дом", uz: "Uy qo'shish" },
        "Add notification": { ru: "Добавить уведомление", uz: "Bildirishnoma qo'shish" },
        "Add payment": { ru: "Добавить оплату", uz: "To'lov qo'shish" },
        "Add apartment": { ru: "Добавить квартиру", uz: "Kvartira qo'shish" },
        "Add resident": { ru: "Добавить резидента", uz: "Rezident qo'shish" },
        "Create district": { ru: "Создать район", uz: "Hudud yaratish" },
        "Create house": { ru: "Создать дом", uz: "Uy yaratish" },
        "Create apartment": { ru: "Создать квартиру", uz: "Kvartira yaratish" },
        "Structure admin form": { ru: "Форма структуры", uz: "Tuzilma formasi" },
        "This form writes a new district directly to Django admin and database.": { ru: "Эта форма записывает новый район прямо в Django admin и базу данных.", uz: "Bu forma yangi hududni to'g'ridan-to'g'ri Django admin va bazaga yozadi." },
        "This form writes a new house directly to Django admin and database.": { ru: "Эта форма записывает новый дом прямо в Django admin и базу данных.", uz: "Bu forma yangi uyni to'g'ridan-to'g'ri Django admin va bazaga yozadi." },
        "This form writes a new apartment directly to Django admin and database.": { ru: "Эта форма записывает новую квартиру прямо в Django admin и базу данных.", uz: "Bu forma yangi kvartirani to'g'ridan-to'g'ri Django admin va bazaga yozadi." },
        "District name": { ru: "Название района", uz: "Hudud nomi" },
        "Address": { ru: "Адрес", uz: "Manzil" },
        "House number": { ru: "Номер дома", uz: "Uy raqami" },
        "House": { ru: "Дом", uz: "Uy" },
        "Apartment number": { ru: "Номер квартиры", uz: "Kvartira raqami" },
        "Area (m²)": { ru: "Площадь (м²)", uz: "Maydon (m²)" },
        "Configure System Alerts": { ru: "Настроить системные уведомления", uz: "Tizim ogohlantirishlarini sozlash" },
        "Configure system alerts": { ru: "Настроить системные уведомления", uz: "Tizim ogohlantirishlarini sozlash" },
        "Backend system alerts": { ru: "Backend системные уведомления", uz: "Backend tizim ogohlantirishlari" },
        "Create and manage live alerts stored in Django admin and database.": { ru: "Создавайте и управляйте живыми уведомлениями, сохранёнными в Django admin и базе данных.", uz: "Django admin va ma'lumotlar bazasida saqlanadigan jonli ogohlantirishlarni yarating va boshqaring." },
        "Alert title": { ru: "Заголовок уведомления", uz: "Ogohlantirish sarlavhasi" },
        "Severity": { ru: "Серьёзность", uz: "Muhimlik" },
        "Category": { ru: "Категория", uz: "Kategoriya" },
        "Assigned to": { ru: "Назначено", uz: "Biriktirilgan" },
        "Action label": { ru: "Название действия", uz: "Amal nomi" },
        "Message": { ru: "Сообщение", uz: "Xabar" },
        "Active alerts": { ru: "Активные уведомления", uz: "Faol ogohlantirishlar" },
        "Create alert": { ru: "Создать уведомление", uz: "Ogohlantirish yaratish" },
        "Whole complex": { ru: "Весь дом", uz: "Butun uy" },
        "System alert": { ru: "Системное уведомление", uz: "Tizim ogohlantirishi" },
        "Acknowledge": { ru: "Подтвердить", uz: "Tasdiqlash" },
        "Resolve": { ru: "Решить", uz: "Hal qilish" },
        "Admin": { ru: "Админ", uz: "Admin" },
        "No live alerts in backend. Create one from this panel.": { ru: "Нет активных уведомлений. Создайте новое в этой панели.", uz: "Faol ogohlantirishlar yo'q. Shu paneldan yangisini yarating." },
        "No active alerts. Create one from this panel.": { ru: "Нет активных уведомлений. Создайте новое в этой панели.", uz: "Faol ogohlantirishlar yo'q. Shu paneldan yangisini yarating." },
        "Create a live alert and it will immediately sync across dashboard, notifications and system health.": { ru: "Создайте live alert, и он сразу синхронизируется в dashboard, notifications и system health.", uz: "Jonli ogohlantirish yarating va u darhol dashboard, notifications va system health bilan sinxronlanadi." },
        "Creating system alert in Django admin and database...": { ru: "Создаётся system alert в Django admin и базе данных...", uz: "Django admin va ma'lumotlar bazasida tizim ogohlantirishi yaratilmoqda..." },
        "System alert created and synced.": { ru: "System alert создан и синхронизирован.", uz: "Tizim ogohlantirishi yaratildi va sinxronlandi." },
        "System alert created": { ru: "System alert создан", uz: "Tizim ogohlantirishi yaratildi" },
        "The alert is now stored in Django admin and visible in the portal.": { ru: "Уведомление сохранено в Django admin и теперь видно в портале.", uz: "Ogohlantirish Django admin'da saqlandi va portaldan ko'rinadi." },
        "Could not create system alert.": { ru: "Не удалось создать system alert.", uz: "Tizim ogohlantirishini yaratib bo'lmadi." },
        "System alert not created": { ru: "System alert не создан", uz: "Tizim ogohlantirishi yaratilmadi" },
        "Check the selected data.": { ru: "Проверьте выбранные данные.", uz: "Tanlangan ma'lumotlarni tekshiring." },
        "Resolving...": { ru: "Закрытие...", uz: "Yopilmoqda..." },
        "Updating...": { ru: "Обновление...", uz: "Yangilanmoqda..." },
        "System alert updated": { ru: "System alert обновлён", uz: "Tizim ogohlantirishi yangilandi" },
        "System alert resolved and synced.": { ru: "System alert закрыт и синхронизирован.", uz: "Tizim ogohlantirishi yopildi va sinxronlandi." },
        "System alert acknowledged and synced.": { ru: "System alert подтверждён и синхронизирован.", uz: "Tizim ogohlantirishi tasdiqlandi va sinxronlandi." },
        "The alert was resolved in Django admin and portal data.": { ru: "Уведомление закрыто в Django admin и portal data.", uz: "Ogohlantirish Django admin va portal data ichida yopildi." },
        "The alert was acknowledged in Django admin and portal data.": { ru: "Уведомление подтверждено в Django admin и portal data.", uz: "Ogohlantirish Django admin va portal data ichida tasdiqlandi." },
        "Could not update system alert.": { ru: "Не удалось обновить system alert.", uz: "Tizim ogohlantirishini yangilab bo'lmadi." },
        "System alert not updated": { ru: "System alert не обновлён", uz: "Tizim ogohlantirishi yangilanmadi" },
        "Review alert": { ru: "Проверить уведомление", uz: "Ogohlantirishni tekshirish" },
        "active": { ru: "активно", uz: "faol" },
        "acknowledged": { ru: "подтверждено", uz: "tasdiqlangan" },
        "resolved": { ru: "решено", uz: "hal qilingan" },
        "critical": { ru: "Критично", uz: "Jiddiy" },
        "warning": { ru: "Предупреждение", uz: "Ogohlantirish" },
        "info": { ru: "Инфо", uz: "Ma'lumot" },
        "Debtor Trends": { ru: "Динамика должников", uz: "Qarzdorlar dinamikasi" },
        "High Risk": { ru: "Высокий риск", uz: "Yuqori xavf" },
        "Critical Debtors (Top 3 Δ)": { ru: "Критичные должники (топ 3 Δ)", uz: "Jiddiy qarzdorlar (top 3 Δ)" },
        "Critical Houses (Top 5)": { ru: "Критичные дома (топ 5)", uz: "Jiddiy uylar (top 5)" },
        "View All Debtors": { ru: "Все должники", uz: "Barcha qarzdorlar" },
        "View All Houses": { ru: "Все дома", uz: "Barcha uylar" },
        "debt residents": { ru: "должников", uz: "qarzdor rezidentlar" },
        "Analytics Overview": { ru: "Обзор аналитики", uz: "Tahlil sharhi" },
        "Analytics dashboard": { ru: "Биллинг по домам", uz: "Uylar bo'yicha billing" },
        "Live billing snapshot from backend residents, payments and current balances.": { ru: "Живой срез по абонентам, оплатам и текущим балансам из backend.", uz: "Backenddagi abonentlar, to'lovlar va joriy balanslar bo'yicha jonli kesim." },
        "Real-time system performance and fiscal health": { ru: "Производительность системы и финансовое состояние в реальном времени", uz: "Tizim samaradorligi va moliyaviy holat real vaqtda" },
        "Last 3 Months": { ru: "Последние 3 месяца", uz: "So'nggi 3 oy" },
        "Filter Views": { ru: "Фильтр видов", uz: "Ko'rinishlarni filtrlash" },
        "Month": { ru: "Месяц", uz: "Oy" },
        "Apts": { ru: "Кв.", uz: "Xon." },
        "Paid this month": { ru: "Оплачено за месяц", uz: "Oy bo'yicha to'langan" },
        "Real successful payments in selected month.": { ru: "Реальные успешные платежи за выбранный месяц.", uz: "Tanlangan oy bo'yicha haqiqiy muvaffaqiyatli to'lovlar." },
        "Payment operations": { ru: "Платёжные операции", uz: "To'lov operatsiyalari" },
        "Successful payment operations in selected month.": { ru: "Успешные платёжные операции за выбранный месяц.", uz: "Tanlangan oy bo'yicha muvaffaqiyatli to'lov operatsiyalari." },
        "Total debt": { ru: "Общий долг", uz: "Jami qarz" },
        "Current negative balances across selected residents.": { ru: "Текущие отрицательные балансы по выбранным абонентам.", uz: "Tanlangan abonentlar bo'yicha joriy manfiy balanslar." },
        "Overpayment": { ru: "Переплата", uz: "Ortiqcha to'lov" },
        "Positive balances across selected residents.": { ru: "Положительные балансы по выбранным абонентам.", uz: "Tanlangan abonentlar bo'yicha musbat balanslar." },
        "Average payment": { ru: "Средний платёж", uz: "O'rtacha to'lov" },
        "Average successful payment in current scope.": { ru: "Средний успешный платёж в текущем срезе.", uz: "Joriy kesimdagi o'rtacha muvaffaqiyatli to'lov." },
        "Average balance": { ru: "Средний баланс", uz: "O'rtacha balans" },
        "Current mean resident balance.": { ru: "Текущий средний баланс абонента.", uz: "Abonentning joriy o'rtacha balansi." },
        "Resident profiles with active contract flag.": { ru: "Профили абонентов с активным договором.", uz: "Faol shartnoma belgisi bor abonent profillari." },
        "Payment dynamics": { ru: "Динамика платежей", uz: "To'lovlar dinamikasi" },
        "Six-month trend from backend payment records.": { ru: "Тренд за шесть месяцев по backend-платежам.", uz: "Backend to'lov yozuvlari bo'yicha olti oylik trend." },
        "Monthly collected": { ru: "Собрано за месяц", uz: "Oy bo'yicha tushum" },
        "Operations": { ru: "Операции", uz: "Operatsiyalar" },
        "Payment channels": { ru: "Каналы оплаты", uz: "To'lov kanallari" },
        // Statistics: payments without a known channel (manual top-ups).
        "Other": { ru: "Прочее", uz: "Boshqa" },
        // Payment notice window: the debtor search and the chosen debtor.
        "Choose a debtor":{ ru: "Выберите должника", uz: "Qarzdorni tanlang" },
        "Search by name, house, apartment, phone or personal account, then pick the debtor.": { ru: "Найдите по имени, дому, квартире, телефону или лицевому счёту и выберите должника.", uz: "Ism, uy, kvartira, telefon yoki abonent raqami bo'yicha qidiring va qarzdorni tanlang." },
        "No debtor found": { ru: "Должник не найден", uz: "Qarzdor topilmadi" },
        "The notice appears here once a debtor is chosen.": { ru: "Уведомление появится здесь, когда будет выбран должник.", uz: "Qarzdor tanlangach, xabarnoma shu yerda ko'rinadi." },
        // Statistics: the debtors list behind the "Debtors" card.
        "No debtors": { ru: "Должников нет", uz: "Qarzdorlar yo'q" },
        "Loading...": { ru: "Загрузка...", uz: "Yuklanmoqda..." },
        // Alerts set for operators (tasks) and the operator's Telegram.
        "Set by": { ru: "Поставил", uz: "Qo'ygan" },
        "you": { ru: "вы", uz: "siz" },
        "without Telegram": { ru: "без Telegram", uz: "Telegramsiz" },
        "No operators found": { ru: "Операторы не найдены", uz: "Operatorlar topilmadi" },
        "Open": { ru: "Открыто", uz: "Ochiq" },
        "Closed": { ru: "Решено", uz: "Hal qilindi" },
        "No Telegram": { ru: "Telegram не подключён", uz: "Telegram ulanmagan" },
        "Not delivered": { ru: "Не доставлено", uz: "Yetkazilmadi" },
        "Also sent to their Telegram.": { ru: "Также придёт в его Telegram.", uz: "Uning Telegramiga ham boradi." },
        "Their Telegram is not connected: the alert is shown in the portal only.": { ru: "Telegram не подключён: оповещение будет только в портале.", uz: "Telegrami ulanmagan: ogohlantirish faqat portalda ko'rinadi." },
        "Alert sent to Telegram": { ru: "Оповещение отправлено в Telegram", uz: "Ogohlantirish Telegramga yuborildi" },
        "The operator has no Telegram: the alert is in the portal only.": { ru: "У оператора нет Telegram: оповещение только в портале.", uz: "Operatorda Telegram yo'q: ogohlantirish faqat portalda." },
        "Telegram did not deliver the alert; it is in the portal.": { ru: "Telegram не доставил оповещение; оно есть в портале.", uz: "Telegram ogohlantirishni yetkazmadi; u portalda bor." },
        "Telegram for alerts": { ru: "Telegram для оповещений", uz: "Ogohlantirishlar uchun Telegram" },
        "Connect Telegram": { ru: "Подключить Telegram", uz: "Telegramni ulash" },
        "Disconnect": { ru: "Отключить", uz: "Uzish" },
        "Not connected: alerts reach you only in the portal.": { ru: "Не подключён: оповещения видны только в портале.", uz: "Ulanmagan: ogohlantirishlar faqat portalda ko'rinadi." },
        "Telegram opened: press Start in the bot. The status here updates by itself.": { ru: "Откроется Telegram: нажмите «Start» в боте. Статус здесь обновится сам.", uz: "Telegram ochiladi: botda «Start» ni bosing. Holat bu yerda o'zi yangilanadi." },
        "Telegram not connected": { ru: "Telegram не подключён", uz: "Telegram ulanmadi" },
        "Distribution by real backend payment methods.": { ru: "Распределение по реальным способам оплаты из backend.", uz: "Backenddagi haqiqiy to'lov usullari bo'yicha taqsimot." },
        "Debt aging": { ru: "Возраст долга", uz: "Qarz yoshi" },
        "How long current debtors have gone without a successful payment.": { ru: "Сколько времени текущие должники без успешного платежа.", uz: "Joriy qarzdorlar muvaffaqiyatli to'lovsiz qancha vaqt qolganini ko'rsatadi." },
        "Balance structure": { ru: "Структура баланса", uz: "Balans tuzilmasi" },
        "Current resident balance split by debt, zero and overpayment.": { ru: "Текущий баланс абонентов: долг, ноль и переплата.", uz: "Abonentlarning joriy balansi: qarz, nol va ortiqcha to'lov." },
        "Zero balance": { ru: "Нулевой баланс", uz: "Nol balans" },
        "House debt pressure": { ru: "Долговая нагрузка по домам", uz: "Uylar bo'yicha qarz bosimi" },
        "Top houses by current outstanding balance from real residents.": { ru: "Топ домов по текущему долгу реальных абонентов.", uz: "Haqiqiy abonentlarning joriy qarzi bo'yicha top uylar." },
        "Monthly balance movement": { ru: "Движение баланса по месяцам", uz: "Oylik balans harakati" },
        "Collected payments compared with current outstanding debt.": { ru: "Поступления и списания по реальным операциям.", uz: "Haqiqiy operatsiyalar bo'yicha tushum va yechimlar." },
        "Collected": { ru: "Собрано", uz: "Yig'ildi" },
        "0-30 days": { ru: "0-30 дней", uz: "0-30 kun" },
        "31-60 days": { ru: "31-60 дней", uz: "31-60 kun" },
        "61-90 days": { ru: "61-90 дней", uz: "61-90 kun" },
        "90+ days": { ru: "90+ дней", uz: "90+ kun" },
        "Subtracted": { ru: "Списано", uz: "Yechildi" },
        "Selected month": { ru: "Выбранный месяц", uz: "Tanlangan oy" },
        "House finance table": { ru: "Таблица по домам", uz: "Uylar bo'yicha jadval" },
        "Real backend breakdown by house, payments and debt.": { ru: "Реальная backend-детализация по дому, оплатам и долгу.", uz: "Uy, to'lovlar va qarz bo'yicha haqiqiy backend tafsiloti." },
        "No building rows in current scope.": { ru: "В текущем срезе нет строк по домам.", uz: "Joriy kesimda uylar bo'yicha satrlar yo'q." },
        "No building rows match the selected house and month.": { ru: "Для выбранного дома и месяца строки не найдены.", uz: "Tanlangan uy va oy bo'yicha satrlar topilmadi." },
        "Total Units": { ru: "Всего объектов", uz: "Jami obyektlar" },
        "Total Subscribers": { ru: "Всего абонентов", uz: "Jami abonentlar" },
        "Total YTD Payments": { ru: "Платежи с начала года", uz: "Yil boshidan to'lovlar" },
        "Total Debt Burden": { ru: "Общая долговая нагрузка", uz: "Jami qarz yuki" },
        "Balance (Monthly Distribution)": { ru: "Баланс (помесячное распределение)", uz: "Balans (oylik taqsimot)" },
        "System-wide financial overview across core categories": { ru: "Финансовый обзор по основным категориям системы", uz: "Asosiy kategoriyalar bo'yicha moliyaviy sharh" },
        "Debit": { ru: "Дебет", uz: "Debet" },
        "Credit": { ru: "Зачислить", uz: "Hisobga kiritish" },
        "Accruals": { ru: "Начисления", uz: "Hisoblangan" },
        "Receipts": { ru: "Поступления", uz: "Kirimlar" },
        "Payment Systems": { ru: "Платёжные системы", uz: "To'lov tizimlari" },
        "Total Transaction Volume": { ru: "Общий объём транзакций", uz: "Jami tranzaksiya hajmi" },
        "Optimal flow across all residential sectors": { ru: "Оптимальный поток по всем жилым секторам", uz: "Barcha turar joy sektorlarida optimal oqim" },
        "System Diagnostics": { ru: "Диагностика системы", uz: "Tizim diagnostikasi" },
        "Recent Transaction Log": { ru: "Последние транзакции", uz: "So'nggi tranzaksiyalar" },
        "View All": { ru: "Смотреть все", uz: "Hammasini ko'rish" },
        "Resident directory": { ru: "Каталог жильцов", uz: "Yashovchilar katalogi" },
        "No residents available": { ru: "Нет доступных жильцов", uz: "Mavjud yashovchilar yo'q" },
        "Residential Complex Management": { ru: "Управление домами", uz: "Uylarni boshqarish" },
        "Managing 124 active residents across 48 units.": { ru: "124 активных жильца в 48 объектах.", uz: "48 obyekt bo'yicha 124 faol yashovchi." },
        "Add New Resident": { ru: "Добавить жильца", uz: "Yangi yashovchi qo'shish" },
        "Resident admin form": { ru: "Форма admin panel", uz: "Admin panel formasi" },
        "This form writes directly to Django admin and database.": { ru: "Эта форма напрямую записывает данные в Django admin и DB.", uz: "Bu forma ma'lumotlarni Django admin va DB ga to'g'ridan-to'g'ri yozadi." },
        "Full name": { ru: "Полное имя", uz: "To'liq ism" },
        "Phone": { ru: "Телефон", uz: "Telefon" },
        "Complex": { ru: "Дом", uz: "Uy" },
        "Building": { ru: "Дом", uz: "Uy" },
        "Section": { ru: "Секция", uz: "Seksiya" },
        "Apartment": { ru: "Квартира", uz: "Kvartira" },
        "Contract status": { ru: "Статус договора", uz: "Shartnoma holati" },
        "Telegram status": { ru: "Статус Telegram", uz: "Telegram holati" },
        "Telegram id": { ru: "Telegram ID", uz: "Telegram ID" },
        "Telegram user": { ru: "Телеграм", uz: "Telegram" },
        "TG user": { ru: "TG user", uz: "TG user" },
        "TG status": { ru: "TG status", uz: "TG status" },
        "Contract": { ru: "Договор", uz: "Shartnoma" },
        "History": { ru: "История", uz: "Tarix" },
        "Edit": { ru: "Изменить", uz: "Tahrirlash" },
        "Resident ID": { ru: "ID абонента", uz: "Abonent ID" },
        "Resident profile": { ru: "Профиль абонента", uz: "Abonent profili" },
        "Loaded from database": { ru: "Загружено из базы данных", uz: "Bazada yuklangan" },
        "No photo": { ru: "Нет фото", uz: "Rasm yo'q" },
        "No transactions found": { ru: "Транзакции не найдены", uz: "Tranzaksiyalar topilmadi" },
        "Date time": { ru: "Дата и время", uz: "Sana va vaqt" },
        "Total amount": { ru: "Общая сумма", uz: "Umumiy summa" },
        "Balance before": { ru: "Баланс до", uz: "Oldingi balans" },
        "Balance after": { ru: "Баланс после", uz: "Keyingi balans" },
        "Date from": { ru: "Дата с", uz: "Sana dan" },
        "Date to": { ru: "Дата по", uz: "Sana gacha" },
        "File type": { ru: "Тип файла", uz: "Fayl turi" },
        "All houses": { ru: "Все дома", uz: "Barcha uylar" },
        "All apartments": { ru: "Все квартиры", uz: "Barcha kvartiralar" },
        "All residents": { ru: "Все абоненты", uz: "Barcha abonentlar" },
        "Reset filters": { ru: "Сбросить фильтры", uz: "Filtrlarni tiklash" },
        "Only free apartments are shown. Occupied apartments must be edited in admin.": { ru: "Показаны только свободные квартиры. Занятые квартиры редактируются в admin.", uz: "Faqat bo'sh kvartiralar ko'rsatiladi. Band kvartiralar adminda tahrirlanadi." },
        "Create resident": { ru: "Создать жильца", uz: "Yashovchi yaratish" },
        "Consumption & Collections Overview": { ru: "Потребление и сборы", uz: "Iste'mol va tushumlar sharhi" },
        "Active Debtors": { ru: "Активные должники", uz: "Faol qarzdorlar" },
        "Payments this month": { ru: "Платежи за месяц", uz: "Bu oydagi to'lovlar" },
        "Total Outstanding": { ru: "Общая задолженность", uz: "Jami qarzdorlik" },
        "Collection Rate": { ru: "Уровень сборов", uz: "Yig'im darajasi" },
        "Total Complex Usage": { ru: "Общее потребление дома", uz: "Uy bo'yicha jami iste'mol" },
        "Nominal Flow Detected": { ru: "Номинальный поток", uz: "Nominal oqim aniqlandi" },
        "Active Residents": { ru: "Активные жильцы", uz: "Faol yashovchilar" },
        "Filter:": { ru: "Фильтр:", uz: "Filtr:" },
        "ALL": { ru: "Все", uz: "Hammasi" },
        "Report type": { ru: "Тип отчёта", uz: "Hisobot turi" },
        "General overview": { ru: "Общий отчёт", uz: "Umumiy holat" },
        "Debtors list": { ru: "Список должников", uz: "Qarzdorlar ro'yxati" },
        "Payment history": { ru: "История платежей", uz: "To'lovlar tarixi" },
        "Debtors list + payment history": { ru: "Список должников + история платежей", uz: "Qarzdorlar ro'yxati + to'lovlar tarixi" },
        "Download file": { ru: "Скачать файл", uz: "Faylni yuklab olish" },
        "Download ready": { ru: "Файл готов", uz: "Fayl tayyor" },
        "Unassigned owner": { ru: "Владелец не назначен", uz: "Egasi biriktirilmagan" },
        "Telegram username": { ru: "Имя пользователя Telegram", uz: "Telegram foydalanuvchi nomi" },
        "Resident created": { ru: "Абонент создан", uz: "Abonent yaratildi" },
        "Payment notice downloaded as PDF": { ru: "Платёжное уведомление скачано в PDF", uz: "To'lov xabarnomasi PDF qilib yuklandi" },
        "Billing notice sent to Telegram": { ru: "Платёжное уведомление отправлено в Telegram", uz: "To'lov xabarnomasi Telegramga yuborildi" },
        "Status assigned": { ru: "Статус назначен", uz: "Holat belgilandi" },
        "Technician assigned": { ru: "Назначен техник", uz: "Texnik biriktirildi" },
        "Audit event": { ru: "Событие аудита", uz: "Audit hodisasi" },
        "Balance history": { ru: "История баланса", uz: "Balans tarixi" },
        "Balance history was saved as Excel.": { ru: "История баланса сохранена в Excel.", uz: "Balans tarixi Excel ko'rinishida saqlandi." },
        "Export failed": { ru: "Экспорт не выполнен", uz: "Eksport bajarilmadi" },
        "Backend export failed.": { ru: "Не удалось сформировать файл.", uz: "Faylni yaratib bo'lmadi." },
        "Source": { ru: "Источник", uz: "Manba" },
        "Usage Report": { ru: "Отчёт потребления", uz: "Iste'mol hisoboti" },
        "DEBTORS": { ru: "ДОЛЖНИКИ", uz: "QARZDORLAR" },
        "PAID": { ru: "ОПЛАЧЕНО", uz: "TO'LANGAN" },
        "Current Balance": { ru: "Текущий баланс", uz: "Joriy balans" },
        "Phone:": { ru: "Телефон:", uz: "Telefon:" },
        "Last Payment:": { ru: "Последний платёж:", uz: "Oxirgi to'lov:" },
        "SEND URGENT REMINDER": { ru: "ОТПРАВИТЬ СРОЧНОЕ НАПОМИНАНИЕ", uz: "SHOSHILINCH ESLATMA YUBORISH" },
        "VIEW BILLING HISTORY": { ru: "ИСТОРИЯ НАЧИСЛЕНИЙ", uz: "TO'LOV TARIXI" },
        "Manual": { ru: "Ручной", uz: "Qo'lda" },
        "Manual Adjustment": { ru: "Ручная корректировка", uz: "Qo'lda tuzatish" },
        "Manual adjustment": { ru: "Ручная корректировка", uz: "Qo'lda tuzatish" },
        "Late penalty": { ru: "Пеня за просрочку", uz: "Kechikish jarimasi" },
        "Late Penalty": { ru: "Пеня за просрочку", uz: "Kechikish jarimasi" },
        "Monthly utility payment": { ru: "Ежемесячный коммунальный платёж", uz: "Oylik kommunal to'lov" },
        "Monthly Charge": { ru: "Ежемесячное начисление", uz: "Oylik hisob" },
        "Recalculation": { ru: "Перерасчёт", uz: "Qayta hisoblash" },
        "Adjustment": { ru: "Корректировка", uz: "Tuzatish" },
        "Resident": { ru: "Жилец", uz: "Yashovchi" },
        "Type": { ru: "Тип", uz: "Turi" },
        "Date": { ru: "Дата", uz: "Sana" },
        "Amount (UZS)": { ru: "Сумма (UZS)", uz: "Miqdor (UZS)" },
        "Action": { ru: "Действие", uz: "Amal" },
        "Success": { ru: "Успешно", uz: "Muvaffaqiyatli" },
        "Utility Payment": { ru: "Коммунальный платёж", uz: "Kommunal to'lov" },
        "Usage Payment": { ru: "Оплата потребления", uz: "Iste'mol to'lovi" },
        "Export CSV": { ru: "Экспорт CSV", uz: "CSV eksport" },
        "Complex Performance Overview": { ru: "Обзор эффективности домов", uz: "Uylar samaradorligi sharhi" },
        "Complex Name": { ru: "Название дома", uz: "Uy nomi" },
        "Infrastructure": { ru: "Инфраструктура", uz: "Infratuzilma" },
        "Finances": { ru: "Финансы", uz: "Moliya" },
        "Debt Status": { ru: "Статус долга", uz: "Qarz holati" },
        "Actions": { ru: "Действия", uz: "Amallar" },
        "Low Risk": { ru: "Низкий риск", uz: "Past xavf" },
        "Medium Risk": { ru: "Средний риск", uz: "O'rtacha xavf" },
        "District Insights": { ru: "Показатели района", uz: "Hudud ko'rsatkichlari" },
        "Avg. Temp Control": { ru: "Средний контроль температуры", uz: "O'rtacha harorat nazorati" },
        "Within Target Range": { ru: "В целевом диапазоне", uz: "Maqsadli diapazonda" },
        "Recent Alerts": { ru: "Последние уведомления", uz: "So'nggi ogohlantirishlar" },
        "Maintenance Due": { ru: "Требуется обслуживание", uz: "Xizmat muddati keldi" },
        "Priority: High": { ru: "Приоритет: высокий", uz: "Ustuvorlik: yuqori" },
        "New Connection": { ru: "Новое подключение", uz: "Yangi ulanish" },
        "Audit Scheduled": { ru: "Аудит запланирован", uz: "Audit rejalashtirilgan" },
        "View All Activities": { ru: "Все действия", uz: "Barcha amallar" },
        "Infrastructure Hub": { ru: "Центр инфраструктуры", uz: "Infratuzilma markazi" },
        "View Integrated Network Topology": { ru: "Открыть топологию сети", uz: "Integratsiyalashgan tarmoq topologiyasi" },
        "Page": { ru: "Страница", uz: "Sahifa" },
        "Showing": { ru: "Показано", uz: "Ko'rsatilmoqda" },
        "selected": { ru: "выбрано", uz: "tanlandi" },
        "Water: Optimal": { ru: "Вода: оптимально", uz: "Suv: optimal" },
        "Heating: Optimal": { ru: "Отопление: оптимально", uz: "Isitish: optimal" },
        "Water: Leak Alert": { ru: "Вода: утечка", uz: "Suv: sizib chiqish" },
        "Heating: Maintenance": { ru: "Отопление: обслуживание", uz: "Isitish: xizmat" },
        "Static activity trail for future backend events.": { ru: "Демо-лента для будущих событий backend.", uz: "Kelajak backend hodisalari uchun demo tarix." },
        "Admin User exported billing report for North Sector.": { ru: "Администратор экспортировал биллинговый отчёт Северного сектора.", uz: "Administrator Shimoliy sektor billing hisobotini eksport qildi." },
        "Pressure alert closed after technician confirmation.": { ru: "Alert давления закрыт после подтверждения техника.", uz: "Bosim alerti texnik tasdig'idan keyin yopildi." },
        "Balance adjustment queued for Residential Unit 402B.": { ru: "Корректировка баланса для объекта 402B поставлена в очередь.", uz: "402B obyekt balansi tuzatishi navbatga qo'yildi." },
        "Open complex details": { ru: "Открыть детали дома", uz: "Uy tafsilotlarini ochish" },
        "Open details": { ru: "Открыть детали", uz: "Tafsilotlarni ochish" },
        "Open filters": { ru: "Открыть фильтры", uz: "Filtrlarni ochish" },
        "Review notifications": { ru: "Проверить уведомления", uz: "Bildirishnomalarni ko'rish" },
        "Open audit log": { ru: "Открыть журнал аудита", uz: "Audit jurnalini ochish" },
        "Workspace Settings": { ru: "Настройки рабочего пространства", uz: "Ish maydoni sozlamalari" },
        "Quick preferences for the operations console.": { ru: "Быстрые настройки рабочей консоли.", uz: "Operatsion konsol uchun tezkor sozlamalar." },
        "Settings sync is offline": { ru: "Синхронизация настроек недоступна", uz: "Sozlamalar sinxronlash oflayn" },
        "Local changes remain available and will retry on reconnect.": { ru: "Локальные изменения сохранятся и повторятся после подключения.", uz: "Mahalliy o'zgarishlar saqlanadi va ulanish tiklanganda qayta urinadi." },
        "Backend sync will retry on reconnect and keep current changes queued.": { ru: "Синхронизация с backend повторится после переподключения и сохранит текущие изменения в очереди.", uz: "Backend sinxroni qayta ulanganda davom etadi va joriy o'zgarishlarni navbatda saqlaydi." },
        "Portal mode": { ru: "Режим портала", uz: "Portal rejimi" },
        "Last sync": { ru: "Последняя синхронизация", uz: "Oxirgi sinxronlash" },
        "Interface sound": { ru: "Звук интерфейса", uz: "Interfeys ovozi" },
        "Sound effects": { ru: "Звуковые эффекты", uz: "Ovoz effektlari" },
        "Click, toast and alert feedback.": { ru: "Клики, toast и alert feedback.", uz: "Klik, toast va alert javoblari." },
        "Sound on": { ru: "Звук включён", uz: "Ovoz yoqilgan" },
        "Sound off": { ru: "Звук выключен", uz: "Ovoz o'chirilgan" },
        "Audio feedback enabled.": { ru: "Звуковая обратная связь включена.", uz: "Ovozli javob yoqildi." },
        "Audio feedback muted.": { ru: "Звуковая обратная связь выключена.", uz: "Ovozli javob o'chirildi." },
        "On": { ru: "Вкл", uz: "Yoq" },
        "Off": { ru: "Выкл", uz: "O'ch" },
        "Switch language": { ru: "Сменить язык", uz: "Tilni almashtirish" },
        "Toggle theme": { ru: "Сменить тему", uz: "Mavzuni almashtirish" },
        "Open request modal": { ru: "Открыть форму заявки", uz: "Ariza oynasini ochish" },
        "Open admin panel": { ru: "Открыть админ панель", uz: "Admin panelini ochish" },
        "Capture the request first. Details can be assigned after validation.": { ru: "Сначала зафиксируйте заявку. Детали можно назначить после проверки.", uz: "Avval arizani kiriting. Tafsilotlar tekshiruvdan keyin belgilanadi." },
        "Create request": { ru: "Создать заявку", uz: "Ariza yaratish" },
        "Cancel": { ru: "Отмена", uz: "Bekor qilish" },
        "Export started": { ru: "Экспорт запущен", uz: "Eksport boshlandi" },
        "Backend workflow with saved progress.": { ru: "Backend-процесс с сохранённым прогрессом.", uz: "Saqlangan progressli backend jarayon." },
        "Connected": { ru: "Подключено", uz: "Ulangan" },
        "This checklist is connected to backend checklist notes and audit events.": { ru: "Этот checklist подключён к backend checklist notes и audit events.", uz: "Bu checklist backend checklist notes va audit events bilan ulangan." },
        "Stored in backend audit trail.": { ru: "Сохранено в backend audit trail.", uz: "Backend audit trailga saqlandi." },
        "Audit note save failed": { ru: "Не удалось сохранить audit note", uz: "Audit note saqlanmadi" },
        "Backend audit note was not saved.": { ru: "Backend audit note не была сохранена.", uz: "Backend audit note saqlanmadi." },
        "Backend audit CSV was generated from the current timeline.": { ru: "Backend audit CSV сформирован из текущей ленты.", uz: "Backend audit CSV joriy timeline asosida yaratildi." },
        "Operations helpdesk": { ru: "Операционный helpdesk", uz: "Operatsion helpdesk" },
        "Backend sync active": { ru: "Синхронизация backend активна", uz: "Backend sinxroni faol" },
        "Support ticket created": { ru: "Support ticket создан", uz: "Support ticket yaratildi" },
        "UI issue was added to backend helpdesk.": { ru: "Проблема интерфейса добавлена в backend helpdesk.", uz: "Interfeys muammosi backend helpdeskga qo'shildi." },
        "Support ticket failed": { ru: "Support ticket не создан", uz: "Support ticket yaratilmadi" },
        "Backend helpdesk request failed.": { ru: "Запрос в backend helpdesk завершился ошибкой.", uz: "Backend helpdesk so'rovi bajarilmadi." },
        "Authentication request failed": { ru: "Ошибка запроса авторизации", uz: "Autentifikatsiya so'rovi xato berdi" },
        "Logout request failed.": { ru: "Не удалось выполнить logout-запрос.", uz: "Logout so'rovi bajarilmadi." },
        "Reminder queued": { ru: "Напоминание поставлено в очередь", uz: "Eslatma navbatga qo'yildi" },
        "Technician assignment queued": { ru: "Назначение техника поставлено в очередь", uz: "Texnik tayinlash navbatga qo'yildi" },
        "Filters applied": { ru: "Фильтры применены", uz: "Filtrlar qo'llandi" },
        "Filters reset": { ru: "Фильтры сброшены", uz: "Filtrlar tozalandi" },
        "Request created": { ru: "Заявка создана", uz: "Ariza yaratildi" },
        "Theme updated": { ru: "Тема обновлена", uz: "Mavzu yangilandi" },
        "Language changed": { ru: "Язык изменен", uz: "Til o'zgartirildi" },
        "No residents match this filter": { ru: "Нет жильцов по этому фильтру", uz: "Bu filtr bo'yicha yashovchilar yo'q" },
        "Switch to ALL to restore the full resident list.": { ru: "Переключитесь на ВСЕ, чтобы вернуть полный список жильцов.", uz: "To'liq ro'yxatni qaytarish uchun HAMMASI ni tanlang." },
        "Search residents": { ru: "Поиск жильцов", uz: "Yashovchilarni qidirish" },
        "Minor": { ru: "Незначительные", uz: "Mayda" },
        "Live": { ru: "Онлайн", uz: "Jonli" },
        "Stable": { ru: "Стабильно", uz: "Barqaror" },
        "Online": { ru: "Онлайн", uz: "Onlayn" },
        "Issue": { ru: "Проблема", uz: "Muammo" },
        "Pressure": { ru: "Давление", uz: "Bosim" },
        "Flow": { ru: "Поток", uz: "Oqim" },
        "Latency": { ru: "Задержка", uz: "Kechikish" },
        "Uptime": { ru: "Аптайм", uz: "Ish vaqti" },
        "Nominal": { ru: "Номинально", uz: "Nominal" },
        "No active alerts": { ru: "Нет активных уведомлений", uz: "Faol ogohlantirishlar yo'q" },
        "No recent activity": { ru: "Нет недавних действий", uz: "So'nggi amallar yo'q" },
        "Debt by house": { ru: "Долг по домам", uz: "Uylar bo'yicha qarz" },
        "Current outstanding debt of residents in each house.": { ru: "Текущий долг жильцов каждого дома.", uz: "Har bir uydagi abonentlarning joriy qarzi." },
        "No debt": { ru: "Нет долга", uz: "Qarz yo'q" },
        "No houses yet": { ru: "Домов пока нет", uz: "Hozircha uylar yo'q" },
        "Collected by operator": { ru: "Сбор по операторам", uz: "Operatorlar yig'imi" },
        "No operator": { ru: "Без оператора", uz: "Operatorsiz" },
        "Houses:": { ru: "Дома:", uz: "Uylar:" },
        "payments made": { ru: "платежей", uz: "ta to'lov" },
        "Assign an operator to each house on its admin page.": {
            ru: "Назначьте оператора каждому дому на его странице в админке.",
            uz: "Har bir uyga admin paneldagi sahifasida operator biriktiring.",
        },
        "All residential systems are synced with current local data.": { ru: "Все жилые системы синхронизированы с текущими локальными данными.", uz: "Barcha turar joy tizimlari joriy lokal ma'lumotlar bilan sinxronlangan." },
        "No transactions for selected filters": { ru: "Нет данных по выбранным фильтрам", uz: "Tanlangan filtrlarda ma'lumot topilmadi" },
        "Try another search term or reset filters. Backend data will refresh on retry.": { ru: "Попробуйте другой поисковый запрос или сбросьте фильтры. При повторе данные backend обновятся.", uz: "Boshqa qidiruv so'rovini kiriting yoki filtrlarni tiklang. Qayta urinishda backend ma'lumotlari yangilanadi." },
        "Retry": { ru: "Повторить", uz: "Qayta urinish" },
        "New": { ru: "Новое", uz: "Yangi" },
        "NOW": { ru: "СЕЙЧАС", uz: "HOZIR" },
        "APR": { ru: "АПР", uz: "APR" },
        "MAY": { ru: "МАЙ", uz: "MAY" },
        "Scheduled": { ru: "Запланировано", uz: "Rejalashtirilgan" },
        "Planned": { ru: "В плане", uz: "Rejada" },
        "Pending": { ru: "Ожидает", uz: "Kutilmoqda" },
        "Location": { ru: "Локация", uz: "Joylashuv" },
        "Priority": { ru: "Приоритет", uz: "Ustuvorlik" },
        "Pump Replacement": { ru: "Замена насоса", uz: "Nasosni almashtirish" },
        "Central Hub - Pump #4": { ru: "Центральный узел - насос #4", uz: "Markaziy uzel - nasos #4" },
        "Vista Towers - Main Inlet": { ru: "Vista Towers - главный ввод", uz: "Vista Towers - asosiy kirish" },
        "Harbor West - System 2": { ru: "Harbor West - система 2", uz: "Harbor West - tizim 2" },
        "High": { ru: "Высокий", uz: "Yuqori" },
        "Medium": { ru: "Средний", uz: "O'rta" },
        "Low": { ru: "Низкий", uz: "Past" },
        "COMPLETED": { ru: "ЗАВЕРШЕНО", uz: "YAKUNLANDI" },
        "UPCOMING": { ru: "СКОРО", uz: "KUTILMOQDA" },
        "View Report": { ru: "Открыть отчёт", uz: "Hisobotni ochish" },
        "Reschedule": { ru: "Перенести", uz: "Qayta rejalashtirish" },
        "Filter Cleaning": { ru: "Очистка фильтра", uz: "Filtrni tozalash" },
        "Home": { ru: "Главная", uz: "Bosh sahifa" },
        "Health": { ru: "Системы", uz: "Holat" },
        "Billing": { ru: "Платежи", uz: "To'lovlar" },
        "Maintenance Fee": { ru: "Плата за обслуживание", uz: "Xizmat haqi" },
        "Late Penalty": { ru: "Пеня за просрочку", uz: "Kechikish jarimasi" },
        "Revenue vs Debt: Top 5": { ru: "Выручка vs долг: топ 5", uz: "Tushum va qarz: top 5" },
        "Sector Revenue vs Debt": { ru: "Выручка и долг сектора", uz: "Sektor tushumi va qarzi" },
        "Entire sector": { ru: "Весь сектор", uz: "Butun sektor" },
        "Top 5 Houses by Debt": { ru: "Топ 5 домов по долгу", uz: "Qarz bo'yicha top 5 uy" },
        "houses in debt view": { ru: "домов в выборке долга", uz: "qarz ko'rinishidagi uy" },
        "Collected": { ru: "Собрано", uz: "Yig'ildi" },
        "99% Healthy": { ru: "99% в норме", uz: "99% sog'lom" },
        "100% Healthy": { ru: "100% в норме", uz: "100% sog'lom" },
        "98.5% Healthy": { ru: "98.5% в норме", uz: "98.5% sog'lom" },
        "78% Healthy": { ru: "78% в норме", uz: "78% sog'lom" },
        "90% Healthy": { ru: "90% в норме", uz: "90% sog'lom" },
        "PAYMENT": { ru: "ПЛАТЕЖИ", uz: "TO'LOV" },
        "PROCESSING": { ru: "ОБРАБОТКА", uz: "QAYTA ISHLASH" },
        "SYNC ACTIVE": { ru: "СИНХРОНИЗАЦИЯ АКТИВНА", uz: "SINXRONLASH FAOL" },
        "Main Terminal": { ru: "Главный терминал", uz: "Asosiy terminal" },
        "Digital Wallet": { ru: "Цифровой кошелёк", uz: "Raqamli hamyon" },
        "62% Vol": { ru: "62% объёма", uz: "62% hajm" },
        "38% Vol": { ru: "38% объёма", uz: "38% hajm" },
        "TRANSACTIONS": { ru: "ТРАНЗАКЦИИ", uz: "TRANZAKSIYALAR" },
        "SUCCESS RATE": { ru: "УСПЕШНОСТЬ", uz: "MUVAFFAQIYAT DARAJASI" },
        "Consolidated report for 2,400 endpoints generated at 09:41": { ru: "Сводный отчёт по 2,400 точкам сформирован в 09:41", uz: "2,400 endpoint bo'yicha jamlanma hisobot 09:41 da yaratildi" },
        "Transaction ID": { ru: "ID транзакции", uz: "Tranzaksiya ID" },
        "Payer": { ru: "Плательщик", uz: "To'lovchi" },
        "Provider": { ru: "Провайдер", uz: "Provayder" },
        "Residential Unit 402B": { ru: "Жилой объект 402B", uz: "402B turar joy obyekti" },
        "Residential Unit 12C": { ru: "Жилой объект 12C", uz: "12C turar joy obyekti" },
        "Public Sector A1": { ru: "Общественный сектор A1", uz: "Jamoat sektori A1" },
        "Jan": { ru: "Янв", uz: "Yan" },
        "Feb": { ru: "Фев", uz: "Fev" },
        "Mar": { ru: "Мар", uz: "Mar" },
        "Report Readiness": { ru: "Готовность отчёта", uz: "Hisobot tayyorligi" },
        "Pre-export checklist for finance handoff.": { ru: "Чеклист перед экспортом для финансовой передачи.", uz: "Moliya topshiruvi uchun eksportdan oldingi ro'yxat." },
        "Confirm Payme and Click totals before CSV export.": { ru: "Сверить итоги Payme и Click перед CSV экспортом.", uz: "CSV eksportdan oldin Payme va Click yakunlarini tekshirish." },
        "Review debt rows marked critical or pending.": { ru: "Проверить долги со статусом critical или pending.", uz: "Critical yoki pending qarz qatorlarini tekshirish." },
        "Attach audit note for any manual correction.": { ru: "Добавить audit note для любой ручной корректировки.", uz: "Har bir qo'lda tuzatish uchun audit izohi qo'shish." },
        "Open checklist": { ru: "Открыть чеклист", uz: "Ro'yxatni ochish" },
        "Checklist": { ru: "Чеклист", uz: "Ro'yxat" },
        "Local workflow with saved progress.": { ru: "Локальный процесс с сохранённым прогрессом.", uz: "Saqlangan jarayonli lokal ish oqimi." },
        "Completion": { ru: "Готовность", uz: "Bajarilish" },
        "Scope": { ru: "Область", uz: "Qamrov" },
        "Current workspace": { ru: "Текущая область", uz: "Joriy ish maydoni" },
        "Operations Team": { ru: "Операционная команда", uz: "Operatsion jamoa" },
        "Saved": { ru: "Сохранено", uz: "Saqlangan" },
        "Local": { ru: "Локально", uz: "Lokal" },
        "Saved locally": { ru: "Сохранено локально", uz: "Lokal saqlandi" },
        "Complete visible": { ru: "Выполнить видимые", uz: "Ko'rinadiganlarni bajarish" },
        "Reset": { ru: "Сбросить", uz: "Tozalash" },
        "Copy summary": { ru: "Копировать сводку", uz: "Xulosani nusxalash" },
        "Add note": { ru: "Добавить заметку", uz: "Izoh qo'shish" },
        "Template": { ru: "Шаблон", uz: "Shablon" },
        "Custom note": { ru: "Своя заметка", uz: "Maxsus izoh" },
        "Write a checklist note...": { ru: "Напишите заметку чеклиста...", uz: "Ro'yxat izohini yozing..." },
        "Cancel": { ru: "Отмена", uz: "Bekor qilish" },
        "Open audit log": { ru: "Открыть audit log", uz: "Audit jurnalini ochish" },
        "Mark reviewed": { ru: "Отметить проверенным", uz: "Tekshirildi deb belgilash" },
        "This checklist is connected to local UI actions now. Backend tasks can replace the storage layer later without changing the interface.": { ru: "Чеклист уже связан с локальными действиями интерфейса. Backend позже сможет заменить слой хранения без изменения UI.", uz: "Ro'yxat lokal UI amallariga ulangan. Backend keyin saqlash qatlamini UI o'zgarmasdan almashtirishi mumkin." },
        "Filters reviewed": { ru: "Фильтры проверены", uz: "Filtrlar tekshirildi" },
        "Critical alerts reviewed": { ru: "Критичные alerts проверены", uz: "Jiddiy ogohlantirishlar tekshirildi" },
        "Export package checked": { ru: "Экспорт проверен", uz: "Eksport paketi tekshirildi" },
        "Resident balances checked": { ru: "Балансы жильцов проверены", uz: "Rezident balanslari tekshirildi" },
        "Reviewed filters and visible rows.": { ru: "Проверены фильтры и видимые строки.", uz: "Filtrlar va ko'rinadigan qatorlar tekshirildi." },
        "Critical alerts reviewed and technician ownership checked.": { ru: "Критичные alerts проверены, ответственный техник назначен.", uz: "Jiddiy ogohlantirishlar tekshirildi, mas'ul texnik belgilandi." },
        "Export package checked for current visible data.": { ru: "Экспортный пакет проверен по текущим видимым данным.", uz: "Eksport paketi joriy ko'rinadigan ma'lumotlar bo'yicha tekshirildi." },
        "Resident balances and billing history checked.": { ru: "Балансы жильцов и история платежей проверены.", uz: "Rezident balanslari va to'lov tarixi tekshirildi." },
        "Validate active filters": { ru: "Проверить активные фильтры", uz: "Faol filtrlarni tekshirish" },
        "Confirm district, status and period filters match the current operation scope.": { ru: "Убедиться, что район, статус и период совпадают с текущей задачей.", uz: "Tuman, holat va davr joriy vazifa qamroviga mosligini tekshirish." },
        "Review residents and balances": { ru: "Проверить жильцов и балансы", uz: "Rezidentlar va balanslarni tekshirish" },
        "Check debtor/paid split, resident cards and billing history before handoff.": { ru: "Проверить должников/оплаченных, карточки жильцов и историю платежей перед передачей.", uz: "Topshirishdan oldin qarzdor/to'langan bo'linishi, rezident kartalari va billing tarixini tekshirish." },
        "Resolve visible critical alerts": { ru: "Разобрать видимые critical alerts", uz: "Ko'rinadigan jiddiy ogohlantirishlarni hal qilish" },
        "Open notification center and confirm critical items have an owner or technician.": { ru: "Открыть уведомления и убедиться, что у критичных задач есть ответственный или техник.", uz: "Bildirishnomalarni ochib, jiddiy vazifalarda mas'ul yoki texnik borligini tekshirish." },
        "Prepare export package": { ru: "Подготовить экспорт", uz: "Eksport paketini tayyorlash" },
        "Verify CSV/XLSX/PDF preview includes current visible data and local timestamp.": { ru: "Проверить, что CSV/XLSX/PDF содержит текущие видимые данные и локальное время.", uz: "CSV/XLSX/PDF joriy ko'rinadigan ma'lumotlar va lokal vaqtni o'z ichiga olganini tekshirish." },
        "Attach audit note": { ru: "Добавить audit note", uz: "Audit izohini qo'shish" },
        "Record manual changes or review comments in the local audit trail.": { ru: "Записать ручные изменения или комментарии проверки в локальный audit trail.", uz: "Qo'lda kiritilgan o'zgarishlar yoki tekshiruv izohlarini lokal audit tarixiga yozish." },
        "Mark done": { ru: "Выполнить", uz: "Bajarildi" },
        "Completed": { ru: "Выполнено", uz: "Bajarilgan" },
        "Note": { ru: "Заметка", uz: "Izoh" },
        "Delete": { ru: "Удалить", uz: "O'chirish" },
        "Checklist item removed": { ru: "Пункт чеклиста удалён", uz: "Ro'yxat bandi o'chirildi" },
        "Checklist note removed": { ru: "Заметка чеклиста удалена", uz: "Ro'yxat izohi o'chirildi" },
        "No backend checklist items": { ru: "Нет задач из DB", uz: "DB ro'yxat vazifalari yo'q" },
        "Create checklist items in Django admin to show them here.": { ru: "Создайте пункты чеклиста в Django admin, чтобы они появились здесь.", uz: "Bu yerda ko'rinishi uchun Django admin'da checklist bandlarini yarating." },
        "Removed locally.": { ru: "Удалено локально.", uz: "Lokal o'chirildi." },
        "Data view": { ru: "Данные", uz: "Ma'lumot" },
        "Billing": { ru: "Биллинг", uz: "Billing" },
        "Safety": { ru: "Безопасность", uz: "Xavfsizlik" },
        "Export": { ru: "Экспорт", uz: "Eksport" },
        "Audit": { ru: "Аудит", uz: "Audit" },
        "Export template": { ru: "Экспорт шаблона", uz: "Shablonni eksport qilish" },
        "Resident Operations Kit": { ru: "Операционный набор жильцов", uz: "Rezidentlar operatsion to'plami" },
        "Templates ready": { ru: "Шаблоны готовы", uz: "Shablonlar tayyor" },
        "Quick static templates for handoff, reminders and move-in checks.": { ru: "Статичные шаблоны для передачи, напоминаний и заселения.", uz: "Topshirish, eslatmalar va ko'chib kirish tekshiruvlari uchun statik shablonlar." },
        "Move-in checklist": { ru: "Чеклист заселения", uz: "Ko'chib kirish ro'yxati" },
        "Reminder script": { ru: "Скрипт напоминания", uz: "Eslatma skripti" },
        "Contact sheet": { ru: "Лист контактов", uz: "Kontakt varaqasi" },
        "Resident template preview": { ru: "Предпросмотр шаблона жильцов", uz: "Rezident shabloni ko'rinishi" },
        "Generated from current backend residents and balances.": { ru: "Сформировано по текущим жильцам и балансам из backend.", uz: "Joriy backend rezidentlari va balanslari asosida yaratildi." },
        "Preview generated from current residents visible on this page.": { ru: "Предпросмотр сформирован по жильцам, которые сейчас видны на странице.", uz: "Ko‘rinib turgan rezidentlar asosida ko‘rinish yaratildi." },
        "Residents in scope": { ru: "Жильцов в выборке", uz: "Qamrovdagi rezidentlar" },
        "Debtors in scope": { ru: "Должников в выборке", uz: "Qamrovdagi qarzdorlar" },
        "Action": { ru: "Действие", uz: "Amal" },
        "Copy script": { ru: "Копировать скрипт", uz: "Skriptni nusxalash" },
        "Close": { ru: "Закрыть", uz: "Yopish" },
        "Move-in checklist opened": { ru: "Чеклист заселения открыт", uz: "Ko'chib kirish ro'yxati ochildi" },
        "Resident kit synced": { ru: "Шаблон синхронизирован", uz: "Shablon sinxronlandi" },
        "Reminder script prepared": { ru: "Скрипт напоминания подготовлен", uz: "Eslatma skripti tayyorlandi" },
        "Reminder script copied": { ru: "Скрипт напоминания скопирован", uz: "Eslatma skripti nusxalandi" },
        "Contact sheet downloaded": { ru: "Лист контактов скачан", uz: "Kontakt varaqasi yuklandi" },
        "Resident contact sheet exported.": { ru: "Контактный лист жильцов экспортирован.", uz: "Rezident kontakt varaqasi eksport qilindi." },
        "Reminder script is ready for the current debtor residents.": { ru: "Скрипт готов для текущих должников.", uz: "Joriy qarzdor rezidentlar uchun skript tayyor." },
        "Checklist synced with backend audit log.": { ru: "Чеклист синхронизирован с backend audit log.", uz: "Ro'yxat backend audit log bilan sinxronlandi." },
        "Open alert in admin": { ru: "Открыть alert в admin", uz: "Alertni adminda ochish" },
        "Open maintenance in admin": { ru: "Открыть обслуживание в admin", uz: "Texnik xizmatni adminda ochish" },
        "Critical alert opened": { ru: "Критичный alert открыт", uz: "Jiddiy alert ochildi" },
        "Checklist opened": { ru: "Чеклист открыт", uz: "Ro'yxat ochildi" },
        "Complex": { ru: "Дом", uz: "Uy" },
    "Infra": { ru: "Инфра", uz: "Infra" },
    "Systems": { ru: "Системы", uz: "Tizim" },
    "Area": { ru: "Площадь", uz: "Maydon" },
    "Personal account": { ru: "Лицевой счет", uz: "Abonent raqami" },
    "Finance": { ru: "Финансы", uz: "Moliya" },
        "Actions": { ru: "Действия", uz: "Amal" },
        "House": { ru: "Дом", uz: "Uy" },
        "Apartment": { ru: "Квартира", uz: "Xonadon" },
        "Apartment data": { ru: "Данные квартиры", uz: "Xonadon ma'lumotlari" },
        "Apartments": { ru: "Квартиры", uz: "Xonadonlar" },
        "Buildings": { ru: "Зданий", uz: "Binolar" },
        "Units": { ru: "Квартир", uz: "Xonadonlar" },
        "Unit": { ru: "Номер", uz: "Xonadon" },
        "Rooms": { ru: "Комнаты", uz: "Xonalar" },
        "floors": { ru: "этажей", uz: "qavat" },
        "entrance": { ru: "подъезд", uz: "kirish" },
        "rooms": { ru: "комн.", uz: "xona" },
        "2 rooms": { ru: "2 комн.", uz: "2 xona" },
        "3 rooms": { ru: "3 комн.", uz: "3 xona" },
        "4 rooms": { ru: "4 комн.", uz: "4 xona" },
        "Meter": { ru: "Счётчик", uz: "Hisoblagich" },
        "Monthly charge": { ru: "Ежемесячно", uz: "Oylik to'lov" },
        "Paid": { ru: "Оплатил", uz: "To'langan" },
        "Overdue": { ru: "Просрочено", uz: "Kechikkan" },
        "Review": { ru: "Проверка", uz: "Tekshiruv" },
        "Water": { ru: "Вода", uz: "Suv" },
        "Heating": { ru: "Отопление", uz: "Isitish" },
        "Optimal": { ru: "Оптимально", uz: "Optimal" },
        "Owner away": { ru: "Владелец не дома", uz: "Egasi uyda emas" },
        "Resident": { ru: "Жилец", uz: "Yashovchi" },
        "Occupancy": { ru: "Проживание", uz: "Yashash holati" },
        "Owner profile": { ru: "Профиль владельца", uz: "Egasi profili" },
        "Recent activity": { ru: "Последняя активность", uz: "So'nggi faollik" },
        "Last visit": { ru: "Последний визит", uz: "So'nggi tashrif" },
        "Transaction": { ru: "Транзакция", uz: "Tranzaksiya" },
        "Resident balance updated": { ru: "Баланс абонента обновлён", uz: "Abonent balansi yangilandi" },
        "Phone copied": { ru: "Номер скопирован", uz: "Telefon nusxalandi" },
        "No matching buildings or residents": { ru: "Дома или жильцы не найдены", uz: "Uylar yoki yashovchilar topilmadi" },
        "System Logs": { ru: "Системные логи", uz: "Tizim loglari" },
        "API Documentation": { ru: "Документация API", uz: "API hujjatlari" },
        "© 2024 HydroFlow Enterprise v2.4.0 • Infrastructure Utility Protocol": { ru: "© 2024 HydroFlow Enterprise v2.4.0 • Протокол коммунальной инфраструктуры", uz: "© 2024 HydroFlow Enterprise v2.4.0 • Kommunal infratuzilma protokoli" },
    };

    const placeholderTranslations = {
        "Search debtors...": { ru: "Поиск должников...", uz: "Qarzdorlarni qidirish..." },
        "Search data points...": { ru: "Поиск данных...", uz: "Ma'lumotlarni qidirish..." },
        "Search": { ru: "Поиск", uz: "Qidirish" },
        "Recent requests": { ru: "Недавние запросы", uz: "So'nggi so'rovlar" },
        "No results": { ru: "Ничего не найдено", uz: "Natija topilmadi" },
        "Search inside table...": { ru: "Поиск в таблице...", uz: "Jadvaldan qidirish..." },
        "Search audit events...": { ru: "Поиск событий аудита...", uz: "Audit hodisalarini qidirish..." },
        "Search residents...": { ru: "Поиск жильцов...", uz: "Yashovchilarni qidirish..." },
        "Search by name, phone, Telegram, house, apartment or personal account...": { ru: "Поиск по имени, телефону, Telegram, дому, квартире или лицевому счёту...", uz: "Ism, telefon, Telegram, uy, kvartira yoki abonent raqami bo'yicha qidirish..." },
        "Search by name, phone, house, apartment or personal account...": { ru: "Поиск по имени, телефону, дому, квартире или лицевому счёту...", uz: "Ism, telefon, uy, kvartira yoki abonent raqami bo'yicha qidirish..." },
        "Search district, house, apartment, resident...": { ru: "Поиск района, дома, квартиры, жильца...", uz: "Hudud, uy, xonadon, yashovchi..." },
        "Search residents, reports, alerts, actions...": { ru: "Поиск жителей, отчетов, уведомлений, действий...", uz: "Rezidentlar, hisobotlar, xabarlar, amallar..." },
        "Pressure drop detected, payment sync delayed...": { ru: "Падение давления, задержка синхронизации платежей...", uz: "Bosim pasaydi, to'lov sinxronizatsiyasi kechikdi..." },
        "Operations Team": { ru: "Операционная команда", uz: "Operatsion jamoa" },
        "Review alert": { ru: "Проверить уведомление", uz: "Ogohlantirishni tekshirish" },
        "Explain the issue, scope and next action.": { ru: "Опишите проблему, охват и следующее действие.", uz: "Muammo, qamrov va keyingi amalni yozing." },
        "Resident name": { ru: "Имя жильца", uz: "Yashovchi ismi" },
        "Unit identifier": { ru: "Номер объекта", uz: "Obyekt raqami" },
    };

    const normalizeText = (value) => value.replace(/\s+/g, " ").trim();
    const canonicalTranslationKey = (value) => normalizeText(String(value || "")).toLowerCase();
    const translationKeyIndex = Object.keys(translations).reduce((map, key) => {
        map.set(canonicalTranslationKey(key), key);
        return map;
    }, new Map());
    const resolveTranslationKey = (key) => {
        const canonical = translationKeyIndex.get(canonicalTranslationKey(key));
        return canonical || String(key || "");
    };
    const translatableTextNodes = new Map();
    const translateValue = (key, lang) => {
        if (lang === "en") return key;
        const resolvedKey = resolveTranslationKey(key);
        return translations[resolvedKey]?.[lang] || key;
    };
    const currentInterfaceLang = () => storage.getItem("hydroflow-lang") || "en";
    const t = (key) => translateValue(key, currentInterfaceLang());

    const captureTranslatableNodes = () => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.parentElement) return NodeFilter.FILTER_REJECT;
                if (["SCRIPT", "STYLE", "TEXTAREA"].includes(node.parentElement.tagName)) return NodeFilter.FILTER_REJECT;
                if (
                    node.parentElement.closest(
                        ".material-symbols-outlined, .material-symbols-rounded, .material-symbols-sharp, [data-icon]"
                    )
                ) {
                    return NodeFilter.FILTER_REJECT;
                }
                const key = resolveTranslationKey(node.nodeValue);
                return translations[key] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            },
        });
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const key = resolveTranslationKey(node.nodeValue);
            if (!translatableTextNodes.has(node)) {
                translatableTextNodes.set(node, {
                    key,
                    prefix: node.nodeValue.match(/^\s*/)?.[0] || "",
                    suffix: node.nodeValue.match(/\s*$/)?.[0] || "",
                });
            }
            const actionButton = node.parentElement.closest("button");
            if (actionButton && !actionButton.dataset.actionKey) {
                actionButton.dataset.actionKey = key;
            }
        }
        document.querySelectorAll("input[placeholder]").forEach((input) => {
            const key = input.dataset.i18nPlaceholder || input.getAttribute("placeholder");
            if (placeholderTranslations[key]) input.dataset.i18nPlaceholder = key;
        });
    };

    const applyTranslations = (lang) => {
        captureTranslatableNodes();
        translatableTextNodes.forEach((entry, node) => {
            if (!document.body.contains(node)) {
                translatableTextNodes.delete(node);
                return;
            }
            if (node.parentElement?.closest("[data-stat-synced='true']")) return;
            node.nodeValue = `${entry.prefix}${translateValue(entry.key, lang)}${entry.suffix}`;
        });
        document.querySelectorAll("[data-i18n-key]").forEach((element) => {
            element.textContent = translateValue(element.dataset.i18nKey, lang);
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach((input) => {
            const key = input.dataset.i18nPlaceholder;
            input.setAttribute("placeholder", lang === "en" ? key : placeholderTranslations[key]?.[lang] || key);
        });
        window.HydroFlowSyncResidentialLabels?.(lang);
        document.querySelectorAll("[data-page-label]").forEach((element) => {
            const numbers = element.textContent.match(/\d+/g) || [];
            const current = element.dataset.pageCurrent || numbers[0] || "1";
            const total = element.dataset.pageTotal || numbers[1] || current;
            element.dataset.pageCurrent = current;
            element.dataset.pageTotal = total;
            if (lang === "ru") element.textContent = `Страница ${current} из ${total}`;
            else if (lang === "uz") element.textContent = `${current} / ${total} sahifa`;
            else element.textContent = `Page ${current} of ${total}`;
        });
        document.querySelectorAll("[data-selected-count]").forEach((element) => {
            const count = element.dataset.count || element.textContent.match(/\d+/)?.[0] || "0";
            element.dataset.count = count;
            if (lang === "ru") element.textContent = `${count} выбрано`;
            else if (lang === "uz") element.textContent = `${count} tanlandi`;
            else element.textContent = `${count} selected`;
        });
    };

    const moneyFormatter = new Intl.NumberFormat("en-US");
    // Space-grouped amounts ("1 000 000 000 UZS"), as written in Uzbek and Russian.
    const spacedNumberFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
    const formatSpacedUzs = (value) => `${spacedNumberFormatter.format(Math.round(Number(value) || 0)).replace(/\u00a0|\u202f/g, " ")} UZS`;
    const formatBillingUzs = (value) => `${moneyFormatter.format(Math.round(Number(value) || 0))} UZS`;
    const formatAreaM2 = (value) => {
        const numeric = Number(value || 0);
        if (!Number.isFinite(numeric) || numeric <= 0) return "--";
        return `${numeric.toLocaleString("en-US", { maximumFractionDigits: 2 })} m²`;
    };
    const formatTelegramHandle = (value) => {
        const raw = String(value || "").trim();
        if (!raw) return "";
        return raw.startsWith("@") ? raw : `@${raw}`;
    };
    // What to show where a Telegram username goes: the @handle; "Not found" for a resident who
    // registered in the bot from an account without a username (the phone links them anyway);
    // "Not linked" while they have not registered.
    const telegramHandleText = (resident) => formatTelegramHandle(resident?.telegramUser)
        || t(resident?.telegramConnected ? "Username not found" : "Not linked");
    const telegramHandleMarkup = (resident, className) => {
        const handle = formatTelegramHandle(resident?.telegramUser);
        if (handle) return `<strong class="${className} is-telegram-connected">${escapeHtml(handle)}</strong>`;
        const key = resident?.telegramConnected ? "Username not found" : "Not linked";
        return `<strong class="${className} is-telegram-empty" data-i18n-key="${key}">${escapeHtml(t(key))}</strong>`;
    };
    const houseApartmentLabel = (resident) => [resident?.building, resident?.apartmentNumber || resident?.apartment]
        .filter(Boolean)
        .join(" · ") || "-";
    const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    }[char]));
    const initialsFor = (name) => String(name || "HF").split(/\s+/).map((part) => part[0] || "").join("").slice(0, 2).toUpperCase();
    // The API answers 401 when the session is missing or expired: send the user to the login page.
    const redirectToLoginIfUnauthorized = (response) => {
        if (response?.status !== 401) return false;
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/login/?next=${encodeURIComponent(next)}`);
        return true;
    };

    const billingData = {
        complexes: [],
        residents: [],
        transactions: [],
        notifications: [],
        systemAlerts: [],
        auditEvents: [],
        checklistItems: [],
        checklistNotes: [],
        // Full-history payment figures computed by the backend; transactions above are only the
        // latest rows of each account.
        paymentSummary: { months: [], monthly: [], channels: {}, currentMonthPayments: 0 },
        // Debt, overpayment and debtors of each house at the end of each of those months.
        balanceSummary: [],
        profile: {},
    };

    // The snapshot lists a house's apartments as [apartmentBackendId, status] pairs: the rest of an
    // apartment row repeats its resident row (portal/backend_data.py, snapshot_apartment_refs).
    const expandApartmentRows = (complexes, residents) => {
        const residentByApartment = new Map(residents.map((resident) => [resident.apartmentBackendId, resident]));
        complexes.forEach((complex) => (complex.buildingItems || []).forEach((building) => {
            building.apartments = (building.apartments || []).map((entry) => {
                if (!Array.isArray(entry)) return entry;
                const [apartmentId, status] = entry;
                const resident = residentByApartment.get(apartmentId);
                if (!resident) return null;
                const occupied = resident.ownerBackendId !== null && resident.ownerBackendId !== undefined;
                return {
                    id: resident.id,
                    backendId: apartmentId,
                    apartmentBackendId: apartmentId,
                    ownerBackendId: resident.ownerBackendId,
                    complexId: resident.complexId,
                    complexBackendId: resident.complexBackendId,
                    buildingId: resident.buildingId,
                    buildingBackendId: resident.buildingBackendId,
                    unit: resident.apartmentNumber,
                    personalAccount: resident.personalAccount,
                    owner: {
                        name: resident.name,
                        phone: resident.phone,
                        email: "",
                        photo: "",
                        telegramUser: resident.telegramUser,
                        telegramConnected: resident.telegramConnected,
                    },
                    balance: resident.balance,
                    status,
                    rooms: "Apartment",
                    area: resident.area,
                    charge: "",
                    contract: resident.contract,
                    visit: "",
                    lastPayment: resident.lastPayment,
                    occupancy: occupied ? "Resident" : "Vacant",
                    isOccupied: occupied,
                };
            }).filter(Boolean);
        }));
    };

    const applyBackendBillingData = (payload) => {
        if (!payload || !Array.isArray(payload.complexes) || !Array.isArray(payload.residents) || !Array.isArray(payload.transactions)) {
            return false;
        }
        expandApartmentRows(payload.complexes, payload.residents);
        billingData.complexes.splice(0, billingData.complexes.length, ...payload.complexes);
        billingData.residents.splice(0, billingData.residents.length, ...payload.residents);
        billingData.transactions.splice(0, billingData.transactions.length, ...payload.transactions);
        ["notifications", "systemAlerts", "auditEvents", "checklistItems", "checklistNotes"].forEach((key) => {
            billingData[key] = Array.isArray(payload[key]) ? payload[key] : [];
        });
        billingData.paymentSummary = payload.paymentSummary && typeof payload.paymentSummary === "object"
            ? payload.paymentSummary
            : { months: [], monthly: [], channels: {}, currentMonthPayments: 0 };
        billingData.balanceSummary = Array.isArray(payload.balanceSummary) ? payload.balanceSummary : [];
        // Everyone an alert can be assigned to (the alert window's "Assigned to" list).
        billingData.operators = Array.isArray(payload.operators) ? payload.operators : [];
        billingData.adminUsers = Array.isArray(payload.adminUsers) ? payload.adminUsers : [];
        billingData.profile =payload.profile && typeof payload.profile === "object" ? payload.profile : {};
        billingData.source = payload.source || "backend";
        billingData.generatedAt = payload.generatedAt || "";
        billingData.dataVersion = payload.dataVersion || "";
        return true;
    };

    applyBackendBillingData(window.HydroFlowBackendData);
    window.HydroFlowApplyBackendData = applyBackendBillingData;

    const renderBackendProfile = () => {
        const profile = billingData.profile || {};
        const lang = currentInterfaceLang();
        const valueOrDash = (value) => {
            const text = String(value ?? "").trim();
            return text || translateValue("Not set", lang);
        };
        const boolLabel = (value) => translateValue(value ? "Yes" : "No", lang);
        const usernameName = String(profile.username || "").trim();
        const fallbackName = String(profile.name || "").trim() || usernameName || "Admin";
        const groupsLabel = Array.isArray(profile.groups) && profile.groups.length
            ? profile.groups.join(", ")
            : valueOrDash(profile.groupsLabel || translateValue("No groups", lang));
        const values = {
            name: fallbackName,
            fullName: valueOrDash(profile.fullName || profile.name || fallbackName),
            username: valueOrDash(profile.username),
            id: valueOrDash(profile.id),
            initials: profile.initials || fallbackName.slice(0, 2).toUpperCase(),
            role: translateValue(profile.role || "Operator", lang),
            email: valueOrDash(profile.email),
            status: translateValue(profile.status || "Active", lang),
            workspace: valueOrDash(profile.workspace || "Mirabad Avenue"),
            organization: valueOrDash(profile.organization || "Mirabad Avenue"),
            accessLevel: translateValue(profile.accessLevel || "Staff access", lang),
            timezone: valueOrDash(profile.timezone || "Asia/Tashkent"),
            lastActive: valueOrDash(profile.lastActive || billingData.generatedAt),
            lastLogin: valueOrDash(profile.lastLogin),
            dateJoined: valueOrDash(profile.dateJoined),
            profileUpdated: valueOrDash(profile.profileUpdated),
            twoFactor: translateValue(profile.twoFactor || "Disabled", lang),
            sessionStatus: translateValue(profile.sessionStatus || "Active", lang),
            staffStatus: boolLabel(Boolean(profile.isStaff)),
            superuserStatus: boolLabel(Boolean(profile.isSuperuser)),
            activeStatus: boolLabel(profile.isActive !== false),
            groupsLabel,
            permissionsCount: valueOrDash(profile.permissionsCount),
            backendSource: profile.backendSource ? translateValue(profile.backendSource, lang) : translateValue("Not set", lang),
            note: valueOrDash(profile.note || "Profile data is loaded from Django admin."),
        };
        document.querySelectorAll("[data-profile-field]").forEach((node) => {
            const key = node.dataset.profileField;
            if (!Object.prototype.hasOwnProperty.call(values, key)) return;
            node.textContent = values[key];
        });
        document.querySelectorAll(".status-dot").forEach((dot) => {
            if (!dot.closest("#profile-drawer")) return;
            dot.classList.toggle("dot-operational", (profile.statusKey || "active") === "active");
            dot.classList.toggle("dot-critical", profile.statusKey === "inactive");
        });
        const lastSync = billingData.generatedAt
            ? new Date(billingData.generatedAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Tashkent",
            }).replace(",", "")
            : "--";
        document.querySelector("[data-sidebar-last-sync]")?.replaceChildren(document.createTextNode(lastSync));
        document.querySelector("[data-sidebar-backend-status]")?.replaceChildren(document.createTextNode(billingData.source ? "Connected" : "Unavailable"));
    };

    renderBackendProfile();

    // The signed-in operator's Telegram (profile drawer): alerts assigned to them are also sent there.
    // "Connect" opens the bot with a one-time link; pressing Start there links the chat, and this
    // section notices it by asking the server every few seconds for a while.
    const setupOperatorTelegram = () => {
        const section = document.querySelector("[data-operator-telegram]");
        if (!section || section.dataset.telegramReady === "true") return;
        section.dataset.telegramReady = "true";
        const statusNode = section.querySelector("[data-operator-telegram-status]");
        const hint = section.querySelector("[data-operator-telegram-hint]");
        const connect = section.querySelector("[data-operator-telegram-connect]");
        const disconnect = section.querySelector("[data-operator-telegram-disconnect]");
        let pollTimer = null;
        const render = (state) => {
            const lang = currentInterfaceLang();
            const connected = Boolean(state?.connected);
            if (statusNode) {
                statusNode.textContent = connected
                    ? `${translateValue("Connected", lang)}${state.username ? ` · @${state.username}` : ""}`
                    : translateValue("Not connected: alerts reach you only in the portal.", lang);
                statusNode.classList.toggle("is-connected", connected);
            }
            connect?.classList.toggle("hidden", connected);
            disconnect?.classList.toggle("hidden", !connected);
            if (connected) hint?.classList.add("hidden");
        };
        const remember = (state) => {
            if (!state) return;
            billingData.profile = { ...(billingData.profile || {}), telegram: { connected: Boolean(state.connected), username: state.username || "" } };
            render(billingData.profile.telegram);
        };
        const stopPolling = () => {
            window.clearInterval(pollTimer);
            pollTimer = null;
        };
        const fetchState = async () => {
            const response = await fetch("/api/operator-telegram/", { headers: { Accept: "application/json" }, credentials: "same-origin" });
            if (redirectToLoginIfUnauthorized(response) || !response.ok) return null;
            return response.json();
        };
        render(billingData.profile?.telegram);
        connect?.addEventListener("click", async () => {
            connect.disabled = true;
            try {
                const payload = await postPortalJson("/api/operator-telegram/", { mode: "link", language: currentInterfaceLang() });
                window.open(payload.link, "_blank", "noopener");
                hint?.classList.remove("hidden");
                stopPolling();
                const startedAt = Date.now();
                pollTimer = window.setInterval(async () => {
                    if (Date.now() - startedAt > 180000) {
                        stopPolling();
                        return;
                    }
                    const state = await fetchState().catch(() => null);
                    if (state?.connected) {
                        stopPolling();
                        remember(state);
                        toast(translateValue("Telegram connected", currentInterfaceLang()), state.username ? `@${state.username}` : "", "success");
                    }
                }, 3000);
            } catch (error) {
                toast(translateValue("Telegram not connected", currentInterfaceLang()), error.message || "", "warning");
            } finally {
                connect.disabled = false;
            }
        });
        disconnect?.addEventListener("click", async () => {
            disconnect.disabled = true;
            try {
                remember(await postPortalJson("/api/operator-telegram/", { mode: "unlink" }));
            } catch (error) {
                toast(translateValue("Telegram not connected", currentInterfaceLang()), error.message || "", "warning");
            } finally {
                disconnect.disabled = false;
            }
        });
        // Opening the profile shows the current state (the operator may have linked from another device).
        document.addEventListener("click", (event) => {
            if (!event.target.closest("[data-drawer-open='profile-drawer']")) return;
            fetchState().then(remember).catch(() => {});
        });
        document.addEventListener("hydroflow:backend-refreshed", () => render(billingData.profile?.telegram));
        document.addEventListener("hydroflow:language-changed", () => render(billingData.profile?.telegram));
    };
    setupOperatorTelegram();

    const getResidentById = (id) => billingData.residents.find((resident) => resident.id === id);
    const getComplexById = (id) => billingData.complexes.find((complex) => complex.id === id);
    const getResidentTransactions = (residentId) => billingData.transactions.filter((transaction) => transaction.residentId === residentId);
    const dateValue = (date) => {
        const [day, month, year] = String(date || "").split("|")[0].trim().split(".").map(Number);
        return new Date(year || 1970, (month || 1) - 1, day || 1).getTime();
    };
    const transactionDateValue = (value) => {
        const normalized = String(value || "").trim();
        if (!normalized) return 0;
        const [datePart = "", timePart = ""] = normalized.split(",");
        const [day, month, year] = datePart.trim().split(".").map(Number);
        const [hours, minutes] = timePart.trim().split(":").map(Number);
        return new Date(year || 1970, (month || 1) - 1, day || 1, hours || 0, minutes || 0).getTime();
    };
    const riskForHealth = (health) => health < 55 ? "Critical" : health < 80 ? "Medium Risk" : "Low Risk";
    const toneForRisk = (risk) => risk === "Critical" ? "red" : risk === "Medium Risk" ? "amber" : "blue";
    const getComplexStats = () => billingData.complexes.map((complex) => {
        const isBackend = Boolean(billingData.source);
        const residents = billingData.residents.filter((resident) => resident.complexId === complex.id);
        const transactions = billingData.transactions.filter((transaction) => transaction.complexId === complex.id);
        const paidResidents = Number.isFinite(Number(complex.paidResidents)) ? Number(complex.paidResidents) : residents.filter((resident) => resident.status === "paid").length;
        const debtorResidents = Number.isFinite(Number(complex.debtorResidents)) ? Number(complex.debtorResidents) : residents.filter((resident) => resident.status === "debtor").length;
        const residentDebt = residents.reduce((total, resident) => total + (resident.balance < 0 ? Math.abs(resident.balance) : 0), 0);
        const collected = (Number(complex.baselineCollected) || 0) + (isBackend ? 0 : transactions
            .filter((transaction) => transaction.status === "Success")
            .reduce((total, transaction) => total + transaction.amount, 0));
        const debt = (Number(complex.extraDebt) || 0) + (isBackend ? 0 : residentDebt);
        const health = Number.isFinite(Number(complex.health)) ? Number(complex.health) : (residents.length ? Math.round((paidResidents / residents.length) * 1000) / 10 : 100);
        const risk = complex.risk || riskForHealth(health);
        const issueEvery = risk === "Critical" ? 3 : risk === "Medium Risk" ? 4 : 0;
        return {
            ...complex,
            residents,
            transactions,
            paidResidents,
            debtorResidents,
            collected,
            debt,
            finances: collected + debt,
            health,
            risk,
            tone: complex.tone || toneForRisk(risk),
            issueEvery,
        };
    });
    const SINGLE_SECTOR_ID = "mirabad-avenue";
    const SINGLE_SECTOR_NAME = "Mirabad Avenue";
    const getSingleSectorStats = () => {
        const complexes = getComplexStats();
        const buildingItems = complexes.flatMap((complex) => (complex.buildingItems || []).map((building) => ({
            ...building,
            parentComplexId: complex.id,
            parentComplexName: complex.name,
            parentComplexBackendId: complex.backendId || "",
            parentSector: complex.sector || SINGLE_SECTOR_NAME,
        })));
        const units = complexes.reduce((total, complex) => total + (Number(complex.units) || 0), 0);
        const buildings = buildingItems.length || complexes.reduce((total, complex) => total + (Number(complex.buildings) || 0), 0);
        const paidResidents = complexes.reduce((total, complex) => total + (Number(complex.paidResidents) || 0), 0);
        const debtorResidents = complexes.reduce((total, complex) => total + (Number(complex.debtorResidents) || 0), 0);
        const debt = complexes.reduce((total, complex) => total + (Number(complex.debt) || 0), 0);
        const collected = complexes.reduce((total, complex) => total + (Number(complex.collected) || 0), 0);
        const totalArea = complexes.reduce((total, complex) => total + (Number(complex.totalArea) || 0), 0);
        const weightedHealth = complexes.reduce((total, complex) => total + ((Number(complex.health) || 0) * Math.max(Number(complex.units) || 0, 1)), 0) / Math.max(units, complexes.length, 1);
        const hasCritical = complexes.some((complex) => complex.risk === "Critical");
        const hasMedium = complexes.some((complex) => complex.risk === "Medium Risk");
        const risk = hasCritical ? "Critical" : hasMedium ? "Medium Risk" : riskForHealth(weightedHealth);
        return {
            id: SINGLE_SECTOR_ID,
            backendId: "",
            name: SINGLE_SECTOR_NAME,
            sector: "Single sector",
            prefix: "House",
            buildings,
            count: buildings,
            units,
            totalArea,
            health: Math.round(weightedHealth * 10) / 10,
            waterM3: complexes.reduce((total, complex) => total + (Number(complex.waterM3) || 0), 0),
            heatingM3: complexes.reduce((total, complex) => total + (Number(complex.heatingM3) || 0), 0),
            collected,
            debt,
            finances: collected + debt,
            image: "",
            icon: "apartment",
            risk,
            tone: toneForRisk(risk),
            debtorResidents,
            paidResidents,
            buildingItems,
            residents: billingData.residents,
            transactions: billingData.transactions,
        };
    };
    const compactNumber = (value, suffix = "") => {
        const numeric = Number(value) || 0;
        if (Math.abs(numeric) >= 1000000000) return `${(numeric / 1000000000).toFixed(1).replace(/\.0$/, "")}B${suffix}`;
        if (Math.abs(numeric) >= 1000000) return `${(numeric / 1000000).toFixed(1).replace(/\.0$/, "")}M${suffix}`;
        if (Math.abs(numeric) >= 1000) return `${(numeric / 1000).toFixed(1).replace(/\.0$/, "")}k${suffix}`;
        return `${moneyFormatter.format(Math.round(numeric))}${suffix}`;
    };
    const formatCompactUzs = (value) => `${compactNumber(value)} UZS`;
    const percentValue = (value) => `${Number(value || 0).toFixed(1).replace(/\.0$/, "")}%`;
    const getSiteStats = () => {
        const complexes = getComplexStats();
        const totalComplexes = complexes.length;
        const now = new Date();
        const isCurrentMonth = (date) => date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
        const parseBackendDate = (value) => {
            if (!value) return null;
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) return parsed;
            const match = String(value).trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
            if (!match) return null;
            const normalized = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
            return Number.isNaN(normalized.getTime()) ? null : normalized;
        };
        const newComplexesThisMonth = (Array.isArray(billingData.complexes) ? billingData.complexes : [])
            .filter((complex) => complex && (complex.backendId || complex.id))
            .map((complex) => parseBackendDate(complex.createdAt || complex.created_at || complex.dateCreated || complex.date_created))
            .filter((date) => date && isCurrentMonth(date))
            .length;
        const totalBuildings = complexes.reduce((total, complex) => total + complex.buildings, 0);
        const totalUnits = complexes.reduce((total, complex) => total + complex.units, 0);
        const occupiedUnits = complexes.reduce((total, complex) => total + Math.round(complex.units * Math.min(0.995, 0.86 + (complex.health / 1000))), 0);
        const totalCollected = complexes.reduce((total, complex) => total + complex.collected, 0);
        const totalDebt = complexes.reduce((total, complex) => total + complex.debt, 0);
        const detailedDebt = billingData.residents.reduce((total, resident) => total + (resident.balance < 0 ? Math.abs(resident.balance) : 0), 0);
        const summaryChannels = billingData.paymentSummary?.channels || {};
        const paymentChannels = ["Payme", "Click", "Cash", "Card", "Card transfer"];
        const methodTotals = Object.fromEntries(paymentChannels.map((channel) => [channel, Number(summaryChannels[channel]?.amount || 0)]));
        const methodResidentCounts = Object.fromEntries(paymentChannels.map((channel) => [channel, Number(summaryChannels[channel]?.residents || 0)]));
        const totalWaterM3 = billingData.complexes.reduce((total, complex) => total + complex.waterM3, 0);
        const totalHeatingM3 = billingData.complexes.reduce((total, complex) => total + complex.heatingM3, 0);
        const totalUsageM3 = totalWaterM3 + totalHeatingM3;
        const weightedHealth = complexes.reduce((total, complex) => total + (complex.health * complex.units), 0) / Math.max(totalUnits, 1);
        const collectionRate = (totalCollected / Math.max(totalCollected + totalDebt, 1)) * 100;
        const criticalComplexes = complexes.filter((complex) => complex.risk === "Critical");
        const warningComplexes = complexes.filter((complex) => complex.risk === "Medium Risk");
        const backendAlerts = Array.isArray(billingData.systemAlerts)
            ? billingData.systemAlerts.filter((alert) => !["resolved", "archived"].includes(String(alert.status || "").toLowerCase()))
            : [];
        const activeAlerts = backendAlerts.length;
        const criticalAlertCount = backendAlerts.length
            ? backendAlerts.filter((alert) => alert.severity === "critical").length
            : criticalComplexes.length;
        const criticalDebtUnits = criticalComplexes.reduce((total, complex) => total + complex.debtorResidents, 0);
        const totalDebtorUnits = complexes.reduce((total, complex) => total + complex.debtorResidents, 0);
        const totalPaidUnits = complexes.reduce((total, complex) => total + complex.paidResidents, 0);
        const detailedResidents = billingData.residents.length;
        const detailedPaidResidents = billingData.residents.filter((resident) => {
            const status = String(resident.status || "").toLowerCase();
            return status === "paid" || Number(resident.balance || 0) >= 0;
        }).length;
        const detailedDebtors = billingData.residents.filter((resident) => {
            const status = String(resident.status || "").toLowerCase();
            return status === "debtor" || Number(resident.balance || 0) < 0;
        }).length;
        return {
            complexes,
            totalComplexes,
            newComplexesThisMonth,
            totalBuildings,
            totalUnits,
            occupiedUnits,
            occupancyRate: (occupiedUnits / Math.max(totalUnits, 1)) * 100,
            totalCollected,
            totalDebt,
            detailedDebt,
            methodTotals,
            methodResidentCounts,
            totalWaterM3,
            totalHeatingM3,
            totalUsageM3,
            weightedHealth,
            collectionRate,
            criticalComplexes,
            warningComplexes,
            activeAlerts,
            criticalAlerts: criticalAlertCount,
            criticalDebtUnits,
            totalDebtorUnits,
            totalPaidUnits: detailedPaidResidents || totalPaidUnits,
            detailedResidents,
            detailedPaidResidents,
            detailedDebtors,
            sectors: 1,
        };
    };

    const analyticsDashboardState = window.HydroFlowAnalyticsDashboardState || { building: "all", month: "" };
    window.HydroFlowAnalyticsDashboardState = analyticsDashboardState;
    const analyticsChartRegistry = window.HydroFlowAnalyticsCharts || {};
    window.HydroFlowAnalyticsCharts = analyticsChartRegistry;
    const syncAnalyticsDashboard = () => {
        const dashboard = document.querySelector("[data-analytics-dashboard]");
        if (!dashboard) return false;
        const lang = storage.getItem("hydroflow-lang") || "en";
        const t = (key) => translateValue(key, lang);
        const localeMap = { ru: "ru-RU", en: "en-US" };
        const uzMonthNames = [
            "yanvar",
            "fevral",
            "mart",
            "aprel",
            "may",
            "iyun",
            "iyul",
            "avgust",
            "sentabr",
            "oktabr",
            "noyabr",
            "dekabr",
        ];
        const isDark = root.dataset.theme === "dark";
        const tooltipBg = isDark ? "#101722" : "#172030";
        const tooltipText = "#F8FBFF";
        const monthKeyFromDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthLabel = (monthKey) => {
            const [year, month] = String(monthKey).split("-").map(Number);
            if (lang === "uz") {
                return `${uzMonthNames[Math.max(0, Math.min(11, (month || 1) - 1))]} ${year}-y.`;
            }
            return new Intl.DateTimeFormat(localeMap[lang] || "en-US", { month: "long", year: "numeric" })
                .format(new Date(year, (month || 1) - 1, 1));
        };
        const sumBy = (items, mapper) => items.reduce((total, item) => total + Number(mapper(item) || 0), 0);
        const setText = (selector, value) => {
            const node = document.querySelector(selector);
            if (node) node.textContent = value;
        };
        const destroyChart = (key) => {
            const chart = analyticsChartRegistry[key];
            if (chart) {
                chart.destroy();
                delete analyticsChartRegistry[key];
            }
        };

        const complexes = Array.isArray(billingData.complexes) ? billingData.complexes : [];
        // One row per (month, house, channel) of successful payments over the whole history.
        const paymentRows = Array.isArray(billingData.paymentSummary?.monthly) ? billingData.paymentSummary.monthly : [];
        // One row per (month, house): debt, overpayment and debtors at the end of that month.
        const balanceRows = Array.isArray(billingData.balanceSummary) ? billingData.balanceSummary : [];
        const buildings = complexes.flatMap((complex) => (complex.buildingItems || []).map((building) => ({
            ...building,
            complexName: complex.name,
        })));
        const monthKeys = (Array.isArray(billingData.paymentSummary?.months) ? billingData.paymentSummary.months : [])
            .filter(Boolean)
            .slice()
            .sort();
        const fallbackMonth = monthKeys[monthKeys.length - 1] || monthKeyFromDate(new Date());
        if (!monthKeys.includes(analyticsDashboardState.month)) analyticsDashboardState.month = fallbackMonth;
        const buildingExists = analyticsDashboardState.building === "all"
            || buildings.some((building) => String(building.id) === String(analyticsDashboardState.building));
        if (!buildingExists) analyticsDashboardState.building = "all";

        const buildingSelect = document.querySelector("[data-analytics-building-select]");
        const monthSelect = document.querySelector("[data-analytics-month-select]");
        if (buildingSelect) {
            buildingSelect.innerHTML = [
                `<option value="all">${escapeHtml(t("All houses"))}</option>`,
                ...buildings.map((building) => `<option value="${escapeHtml(String(building.id))}">${escapeHtml(building.name || building.complexName || t("House"))}</option>`),
            ].join("");
            buildingSelect.value = analyticsDashboardState.building;
            if (buildingSelect.dataset.analyticsReady !== "true") {
                buildingSelect.dataset.analyticsReady = "true";
                buildingSelect.addEventListener("change", (event) => {
                    analyticsDashboardState.building = event.target.value || "all";
                    syncAnalyticsDashboard();
                });
            }
        }
        if (monthSelect) {
            monthSelect.innerHTML = monthKeys.length
                ? monthKeys.slice().reverse().map((monthKey) => `<option value="${escapeHtml(monthKey)}">${escapeHtml(monthLabel(monthKey))}</option>`).join("")
                : `<option value="${escapeHtml(fallbackMonth)}">${escapeHtml(monthLabel(fallbackMonth))}</option>`;
            monthSelect.value = analyticsDashboardState.month;
            if (monthSelect.dataset.analyticsReady !== "true") {
                monthSelect.dataset.analyticsReady = "true";
                monthSelect.addEventListener("change", (event) => {
                    analyticsDashboardState.month = event.target.value || fallbackMonth;
                    syncAnalyticsDashboard();
                });
            }
        }

        const selectedBuilding = analyticsDashboardState.building === "all"
            ? null
            : buildings.find((building) => String(building.id) === String(analyticsDashboardState.building)) || null;
        const selectedBuildings = selectedBuilding ? [selectedBuilding] : buildings;
        const selectedBuildingIds = new Set(selectedBuildings.map((building) => String(building.id)));
        const selectedBuildingBackendIds = new Set(selectedBuildings.map((building) => String(building.backendId || "")));
        const inSelectedBuildings = (row) => !selectedBuilding || selectedBuildingBackendIds.has(String(row.buildingBackendId ?? ""));
        const selectedMonthRows = paymentRows.filter((row) => inSelectedBuildings(row) && row.month === analyticsDashboardState.month);
        // Balances as they stood at the end of the selected month (the current month: right now).
        const monthBalanceRows = balanceRows.filter((row) => row.month === analyticsDashboardState.month);
        const selectedBalanceRows = monthBalanceRows.filter(inSelectedBuildings);

        const debtTotal = sumBy(selectedBalanceRows, (row) => row.debt);
        const overpaymentTotal = sumBy(selectedBalanceRows, (row) => row.overpayment);
        const debtorsCount = sumBy(selectedBalanceRows, (row) => row.debtors);
        const monthPaid = sumBy(selectedMonthRows, (row) => row.amount);
        const channelPalette = {
            Payme: "#3A77F1",
            Click: "#17B26A",
            Cash: "#F59E0B",
            Card: "#6C63FF",
            "Card transfer": "#0EA5E9",
            Other: "#94A3B8",
        };
        const channelOrder = ["Cash", "Card", "Card transfer", "Click", "Payme", "Other"];
        const channelTotals = Object.fromEntries(channelOrder.map((channel) => [channel, 0]));
        // Accounts are counted per house by the backend; houses never share an account, so they add up.
        const channelResidentCounts = Object.fromEntries(channelOrder.map((channel) => [channel, 0]));
        selectedMonthRows.forEach((row) => {
            // Payments without a known channel (manual top-ups) still count in "Paid this month".
            const channel = row.channel in channelTotals ? row.channel : "Other";
            channelTotals[channel] += Number(row.amount || 0);
            channelResidentCounts[channel] += Number(row.residents || 0);
        });
        // "Other" appears only when there is such a payment, so the slices add up to "Paid this month".
        const channelDisplayOrder = channelOrder.filter((channel) => channel !== "Other" || channelTotals.Other > 0);
        // Debt by house at the end of the selected month, largest first.
        const houseDebtRows = selectedBuildings.map((building) => ({
            label: building.number || building.name || t("House"),
            debt: sumBy(monthBalanceRows.filter((row) => String(row.buildingBackendId ?? "") === String(building.backendId || "")), (row) => row.debt),
        })).sort((left, right) => right.debt - left.debt);

        // What the residents of each operator's houses paid in the selected month (houses without an
        // operator together, last).
        const buildingByBackendId = new Map(buildings.map((building) => [String(building.backendId || ""), building]));
        const operatorKey = (building) => (building.operatorId ? `operator-${building.operatorId}` : "none");
        const operatorTotals = new Map();
        selectedBuildings.forEach((building) => {
            const key = operatorKey(building);
            if (!operatorTotals.has(key)) {
                operatorTotals.set(key, { name: building.operatorName || "", unassigned: !building.operatorId, houses: [], amount: 0, payments: 0 });
            }
            operatorTotals.get(key).houses.push(building.number || building.name || "");
        });
        selectedMonthRows.forEach((row) => {
            const building = buildingByBackendId.get(String(row.buildingBackendId ?? ""));
            const entry = building && operatorTotals.get(operatorKey(building));
            if (!entry) return;
            entry.amount += Number(row.amount || 0);
            entry.payments += Number(row.residents || 0);
        });
        const operatorRows = [...operatorTotals.values()]
            .sort((left, right) => (left.unassigned - right.unassigned) || (right.amount - left.amount));

        setText('[data-analytics-value="paid-this-month"]', formatBillingUzs(monthPaid));
        setText('[data-analytics-value="total-debt"]', formatBillingUzs(debtTotal));
        setText('[data-analytics-value="overpayment"]', formatBillingUzs(overpaymentTotal));
        setText('[data-analytics-value="debtors-count"]', moneyFormatter.format(debtorsCount));

        if (window.Chart) {
            destroyChart("analytics-channels");
            const channelsCanvas = document.getElementById("analytics-channel-chart");
            const hasChannelPayments = channelDisplayOrder.some((channel) => (channelTotals[channel] || 0) > 0);
            document.querySelector("[data-analytics-channel-layout]")?.classList.toggle("is-empty", !hasChannelPayments);
            if (channelsCanvas && hasChannelPayments) {
                analyticsChartRegistry["analytics-channels"] = new window.Chart(channelsCanvas, {
                    type: "pie",
                    data: {
                        labels: channelDisplayOrder.map((channel) => t(channel)),
                        datasets: [{
                            data: channelDisplayOrder.map((channel) => channelTotals[channel] || 0),
                            backgroundColor: channelDisplayOrder.map((channel) => channelPalette[channel]),
                            // Thin separators in the panel's color between the slices.
                            borderColor: isDark ? "#121823" : "#FFFFFF",
                            borderWidth: 2,
                            hoverOffset: 4,
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: false,
                        animations: false,
                        resizeDelay: 0,
                        transitions: {
                            active: {
                                animation: {
                                    duration: 0,
                                },
                            },
                            resize: {
                                animation: {
                                    duration: 0,
                                },
                            },
                        },
                        layout: { padding: 4 },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                animation: false,
                                backgroundColor: tooltipBg,
                                titleColor: tooltipText,
                                bodyColor: tooltipText,
                                callbacks: {
                                    label: (context) => `${context.label}: ${formatBillingUzs(context.raw)}`,
                                },
                            },
                        },
                    },
                });
            }
        }

        const houseDebtList = document.querySelector("[data-analytics-house-debt-list]");
        if (houseDebtList) {
            const maxHouseDebt = Math.max(0, ...houseDebtRows.map((row) => row.debt));
            houseDebtList.innerHTML = houseDebtRows.length
                ? houseDebtRows.map((row) => `
                    <li class="analytics-house-debt-row ${row.debt ? "" : "is-clear"}">
                        <span class="analytics-house-debt-name">${escapeHtml(row.label)}</span>
                        <span class="analytics-house-debt-bar" aria-hidden="true"><i style="width:${row.debt && maxHouseDebt ? Math.max(2, (row.debt / maxHouseDebt) * 100) : 0}%"></i></span>
                        <strong class="analytics-house-debt-amount">${escapeHtml(row.debt ? formatSpacedUzs(row.debt) : t("No debt"))}</strong>
                    </li>
                `).join("")
                : `<li class="analytics-house-debt-empty">${escapeHtml(t("No houses yet"))}</li>`;
        }

        const operatorList = document.querySelector("[data-analytics-operator-list]");
        if (operatorList) {
            const maxCollected = Math.max(0, ...operatorRows.map((row) => row.amount));
            const initials = (name) => String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
            const unassignedIcon = '<span class="material-symbols-outlined">person_off</span>';
            operatorList.innerHTML = operatorRows.length
                ? operatorRows.map((row) => {
                    const name = row.unassigned ? t("No operator") : row.name;
                    const width = row.amount && maxCollected ? Math.max(2, (row.amount / maxCollected) * 100) : 0;
                    return `
                    <li class="analytics-operator-row ${row.unassigned ? "is-unassigned" : ""} ${row.amount ? "" : "is-empty"}">
                        <span class="analytics-operator-avatar" aria-hidden="true">${row.unassigned ? unassignedIcon : escapeHtml(initials(name))}</span>
                        <span class="analytics-operator-copy">
                            <strong>${escapeHtml(name)}</strong>
                            <small>${escapeHtml(`${t("Houses:")} ${row.houses.join(", ")}`)}</small>
                        </span>
                        <span class="analytics-operator-bar" aria-hidden="true"><i style="width:${width}%"></i></span>
                        <span class="analytics-operator-amount">
                            <strong>${escapeHtml(formatSpacedUzs(row.amount))}</strong>
                            <small>${escapeHtml(`${moneyFormatter.format(row.payments)} ${t("payments made")}`)}</small>
                        </span>
                    </li>`;
                }).join("")
                : `<li class="analytics-house-debt-empty">${escapeHtml(t("No houses yet"))}</li>`;
            document.querySelector("[data-analytics-operator-hint]")?.classList.toggle("hidden", !operatorRows.some((row) => row.unassigned));
        }

        const channelList = document.querySelector("[data-analytics-channel-list]");
        if (channelList) {
            // Same marks as the Payments page; the pie slice color stays as the card's left edge.
            const channelIcons = {
                Cash: '<span class="material-symbols-outlined analytics-v2-channel-symbol analytics-v2-channel-symbol--cash" aria-hidden="true">payments</span>',
                Card: '<span class="material-symbols-outlined analytics-v2-channel-symbol analytics-v2-channel-symbol--card" aria-hidden="true">credit_card</span>',
                "Card transfer": '<span class="material-symbols-outlined analytics-v2-channel-symbol analytics-v2-channel-symbol--transfer" aria-hidden="true">sync_alt</span>',
                Click: `<img alt="" class="payment-brand-logo payment-brand-logo-click" src="${escapeHtml(channelList.dataset.clickLogo || "")}">`,
                Payme: `<img alt="" class="payment-brand-logo payment-brand-logo-payme" src="${escapeHtml(channelList.dataset.paymeLogo || "")}">`,
                Other: '<span class="material-symbols-outlined analytics-v2-channel-symbol analytics-v2-channel-symbol--other" aria-hidden="true">more_horiz</span>',
            };
            channelList.innerHTML = channelDisplayOrder.map((channel) => `
                <div class="analytics-v2-channel-card" style="--channel-color:${channelPalette[channel]}">
                    <span class="analytics-v2-channel-avatar">${channelIcons[channel] || ""}</span>
                    <div class="analytics-v2-channel-copy">
                        <strong>${escapeHtml(t(channel))}</strong>
                        <span>${escapeHtml(`${t("Residents")}: ${moneyFormatter.format(channelResidentCounts[channel] || 0)}`)}</span>
                    </div>
                    <div class="analytics-v2-channel-value">
                        <strong>${escapeHtml(formatBillingUzs(channelTotals[channel] || 0))}</strong>
                    </div>
                </div>
            `).join("");
        }

        return true;
    };

    // The debtors list, largest debt first. The statistics "Debtors" card ([data-analytics-debtors-open])
    // and cards such as "Active debtors" on the payments page ([data-debtors-list-open]) show every
    // house right now. A row opens the resident's profile; a vacant apartment has nobody to open.
    const setupAnalyticsDebtorsList = () => {
        const modal = document.getElementById("debtors-list-modal");
        if (!modal || modal.dataset.debtorsReady === "true") return;
        modal.dataset.debtorsReady = "true";
        const triggerSelector = "[data-analytics-debtors-open], [data-debtors-list-open]";
        const rowsNode = modal.querySelector("[data-debtors-list-rows]");
        const scopeNode = modal.querySelector("[data-debtors-list-scope]");
        const summaryNode = modal.querySelector("[data-debtors-list-summary]");
        const tr = (key) => translateValue(key, currentInterfaceLang());
        let debtors = null;
        let fromStatistics = false;
        // The statistics page has no house or month picker any more: both lists cover every house now.
        const scopeText = () => {
            const pick = (selector) => (fromStatistics ? document.querySelector(selector)?.selectedOptions[0]?.textContent : "");
            return [
                pick("[data-analytics-building-select]") || tr("All houses"),
                pick("[data-analytics-month-select]") || new Date().toLocaleDateString("ru-RU"),
            ].join(" · ");
        };
        const render = () => {
            if (scopeNode) scopeNode.textContent = scopeText();
            if (!rowsNode) return;
            if (debtors === null) {
                rowsNode.innerHTML = `<tr><td class="debtors-list-empty" colspan="6">${escapeHtml(tr("Loading..."))}</td></tr>`;
                if (summaryNode) summaryNode.textContent = "";
                return;
            }
            const total = debtors.reduce((sum, row) => sum + Number(row.debt || 0), 0);
            if (summaryNode) {
                summaryNode.textContent = `${tr("Debtors")}: ${moneyFormatter.format(debtors.length)} · ${tr("Total debt")}: ${formatBillingUzs(total)}`;
            }
            rowsNode.innerHTML = debtors.length
                ? debtors.map((row, index) => {
                    const owner = String(row.ownerBackendId || "");
                    return `
                        <tr class="${owner ? "is-clickable" : "is-vacant"}" ${owner ? `data-debtor-owner-id="${escapeAttr(owner)}" tabindex="0"` : ""}>
                            <td class="is-index">${index + 1}</td>
                            <td><span class="table-cell-label">${escapeHtml(tr("House"))}</span>${escapeHtml(row.house)}</td>
                            <td><span class="table-cell-label">${escapeHtml(tr("Apartment"))}</span>${escapeHtml(row.apartment)}</td>
                            <td class="is-name">${escapeHtml(owner ? row.name : tr(row.name))}</td>
                            <td><span class="table-cell-label">${escapeHtml(tr("Phone"))}</span>${escapeHtml(row.phone || "—")}</td>
                            <td class="is-amount">${escapeHtml(formatBillingUzs(row.debt))}</td>
                        </tr>
                    `;
                }).join("")
                : `<tr><td class="debtors-list-empty" colspan="6">${escapeHtml(tr("No debtors"))}</td></tr>`;
        };
        const open = async (trigger) => {
            fromStatistics = trigger.matches("[data-analytics-debtors-open]");
            const state = fromStatistics ? window.HydroFlowAnalyticsDashboardState || {} : {};
            const building = (billingData.complexes || [])
                .flatMap((complex) => complex.buildingItems || [])
                .find((item) => String(item.id) === String(state.building));
            debtors = null;
            render();
            openOverlayById("debtors-list-modal");
            const params = new URLSearchParams({ month: state.month || "" });
            if (building?.backendId) params.set("building_id", building.backendId);
            try {
                const response = await fetch(`/api/lists/debtors/?${params}`, { headers: { Accept: "application/json" }, credentials: "same-origin" });
                if (redirectToLoginIfUnauthorized(response)) return;
                const payload = await response.json();
                if (!response.ok) throw new Error(payload.error || response.statusText);
                debtors = Array.isArray(payload.results) ? payload.results : [];
            } catch (error) {
                debtors = [];
                toast(tr("Debtors"), error.message || "", "warning");
            }
            render();
        };
        // One window is open at a time, so the profile replaces this list; closing that profile brings
        // the list back (unless the operator went on from the profile to another window).
        let returnFromProfile = false;
        const openProfile = (row) => {
            const ownerBackendId = row?.dataset.debtorOwnerId;
            if (!ownerBackendId) return;
            const fallback = billingData.residents.find((resident) => String(resident.ownerBackendId || "") === ownerBackendId) || null;
            returnFromProfile = true;
            openResidentProfileByOwner({ ownerBackendId, fallback });
        };
        const profileModal = document.getElementById("resident-command-profile-modal");
        if (profileModal) {
            new MutationObserver(() => {
                if (!returnFromProfile || profileModal.getAttribute("aria-hidden") !== "true") return;
                returnFromProfile = false;
                window.setTimeout(() => {
                    if (document.querySelector(".app-modal.is-open, .app-drawer.is-open")) return;
                    openOverlayById("debtors-list-modal");
                    render();
                }, 0);
            }).observe(profileModal, { attributes: true, attributeFilter: ["aria-hidden"] });
        }
        document.addEventListener("click", (event) => {
            const trigger = event.target.closest(triggerSelector);
            if (trigger) open(trigger);
        });
        document.addEventListener("keydown", (event) => {
            const trigger = event.target.closest?.(triggerSelector);
            if (!trigger || (event.key !== "Enter" && event.key !== " ")) return;
            event.preventDefault();
            open(trigger);
        });
        rowsNode?.addEventListener("click", (event) => openProfile(event.target.closest("[data-debtor-owner-id]")));
        rowsNode?.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;
            openProfile(event.target.closest("[data-debtor-owner-id]"));
        });
        document.addEventListener("hydroflow:language-changed", () => {
            if (modal.getAttribute("aria-hidden") === "false") render();
        });
    };
    setupAnalyticsDebtorsList();

    const syncDashboardStatCards = (stats = getSiteStats()) => {
        const paidPercent = stats.detailedResidents ? (stats.detailedPaidResidents / stats.detailedResidents) * 100 : 0;
        const debtorPercent = stats.detailedResidents ? (stats.detailedDebtors / stats.detailedResidents) * 100 : 0;
        const debtPercent = (stats.detailedDebt / Math.max(stats.detailedDebt + stats.totalCollected, 1)) * 100;
        const cards = {
            "total-residents": {
                value: moneyFormatter.format(stats.detailedResidents),
                support: t("Total linked resident profiles"),
                progress: Math.max(6, Math.min(100, stats.detailedResidents ? 100 : 0)),
            },
            "paid-residents": {
                value: moneyFormatter.format(stats.detailedPaidResidents),
                support: t("Residents with positive or zero balance"),
                progress: paidPercent,
            },
            "total-debtors": {
                value: moneyFormatter.format(stats.detailedDebtors),
                support: t("Residents with overdue balance"),
                progress: debtorPercent,
            },
            "outstanding-debt": {
                value: formatCompactUzs(stats.detailedDebt),
                support: t("Current resident liabilities"),
                progress: debtPercent,
            },
        };
        Object.entries(cards).forEach(([key, payload]) => {
            const card = document.querySelector(`[data-stat-card="${key}"]`);
            if (!card) return;
            const value = card.querySelector("h2");
            const support = card.querySelector("[data-stat-support]");
            const bar = card.querySelector(".chart-bar");
            if (value) {
                value.dataset.statSynced = "true";
                value.textContent = payload.value;
            }
            if (support) {
                support.dataset.statSynced = "true";
                support.textContent = payload.support;
            }
            if (bar) {
                bar.style.width = `${Math.max(3, Math.min(100, payload.progress || 0))}%`;
            }
        });
    };
    window.HydroFlowSyncDashboardStatCards = syncDashboardStatCards;

    const defaultFilterState = { district: "all", status: "all", period: "all", periodStart: "", periodEnd: "" };
    const readFilterState = () => ({ ...defaultFilterState });
    window.HydroFlowBillingData = billingData;

    const toastRegion = document.querySelector("[data-toast-region]");
    const activeToasts = new Map();
    const toastIcons = {
        success: "check_circle",
        info: "info",
        warning: "priority_high",
        danger: "warning",
    };
    const soundStorageKey = "hydroflow-sound";
    const reducedMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const storedSound = storage.getItem(soundStorageKey);
    let soundEnabled = storedSound ? storedSound === "on" : !reducedMotionQuery?.matches;
    let audioContext = null;
    let lastHoverSoundAt = 0;
    let lastSearchSoundAt = 0;
    const soundVolumeBoost = 1.22;

    const getAudioContext = () => {
        if (!soundEnabled) return null;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        if (!audioContext) audioContext = new AudioContextClass();
        if (audioContext.state === "suspended") audioContext.resume?.().catch(() => {});
        return audioContext;
    };

    const tone = (options = {}) => {
        const context = getAudioContext();
        if (!context) return;
        // A suspended context has a frozen clock: tones scheduled on it would start late and clipped.
        if (context.state === "suspended") {
            context.resume?.().then(() => scheduleTone(context, options)).catch(() => {});
            return;
        }
        scheduleTone(context, options);
    };

    const scheduleTone = (context, { frequency = 520, endFrequency = null, duration = 0.055, delay = 0, volume = 0.035, type = "sine" } = {}) => {
        const start = context.currentTime + delay;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const adjustedVolume = Math.min(volume * soundVolumeBoost, 0.06);
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, start);
        if (endFrequency && endFrequency > 0) {
            oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
        }
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(adjustedVolume, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.03);
    };

    const playSound = (kind = "click") => {
        if (!soundEnabled) return;
        if (reducedMotionQuery?.matches && storage.getItem(soundStorageKey) !== "on") return;
        if (kind === "hover") {
            const now = performance.now();
            if (now - lastHoverSoundAt < 130) return;
            lastHoverSoundAt = now;
            tone({ frequency: 820, duration: 0.026, volume: 0.010 });
            return;
        }
        if (kind === "search-focus") {
            tone({ frequency: 720, endFrequency: 540, duration: 0.085, volume: 0.018, type: "sine" });
            tone({ frequency: 1040, endFrequency: 780, duration: 0.095, delay: 0.025, volume: 0.012, type: "sine" });
            return;
        }
        if (kind === "search-input") {
            const now = performance.now();
            if (now - lastSearchSoundAt < 95) return;
            lastSearchSoundAt = now;
            tone({ frequency: 920, endFrequency: 1160, duration: 0.032, volume: 0.009, type: "sine" });
            tone({ frequency: 520, endFrequency: 610, duration: 0.040, delay: 0.012, volume: 0.006, type: "triangle" });
            return;
        }
        if (kind === "toggle") {
            tone({ frequency: 420, duration: 0.045, volume: 0.024 });
            tone({ frequency: 720, duration: 0.060, delay: 0.045, volume: 0.026 });
            return;
        }
        if (kind === "soft-click") {
            tone({ frequency: 540, endFrequency: 620, duration: 0.032, volume: 0.012, type: "sine" });
            tone({ frequency: 760, endFrequency: 700, duration: 0.036, delay: 0.018, volume: 0.008, type: "triangle" });
            return;
        }
        if (kind === "modal-open") {
            tone({ frequency: 430, endFrequency: 560, duration: 0.070, volume: 0.018, type: "triangle" });
            tone({ frequency: 760, endFrequency: 920, duration: 0.085, delay: 0.028, volume: 0.014, type: "sine" });
            return;
        }
        if (kind === "profile-open") {
            tone({ frequency: 410, endFrequency: 520, duration: 0.060, volume: 0.012, type: "triangle" });
            tone({ frequency: 720, endFrequency: 880, duration: 0.074, delay: 0.026, volume: 0.010, type: "sine" });
            return;
        }
        if (kind === "copy") {
            tone({ frequency: 660, endFrequency: 760, duration: 0.040, volume: 0.010, type: "sine" });
            tone({ frequency: 940, endFrequency: 1080, duration: 0.052, delay: 0.030, volume: 0.009, type: "triangle" });
            return;
        }
        if (kind === "modal-close-water") {
            tone({ frequency: 760, endFrequency: 520, duration: 0.080, volume: 0.013, type: "sine" });
            tone({ frequency: 540, endFrequency: 350, duration: 0.105, delay: 0.032, volume: 0.010, type: "triangle" });
            return;
        }
        if (kind === "success") {
            tone({ frequency: 620, endFrequency: 760, duration: 0.052, volume: 0.020, type: "sine" });
            tone({ frequency: 920, endFrequency: 1120, duration: 0.074, delay: 0.048, volume: 0.022, type: "sine" });
            return;
        }
        if (kind === "payment-success") {
            tone({ frequency: 660, endFrequency: 820, duration: 0.050, volume: 0.019, type: "triangle" });
            tone({ frequency: 980, endFrequency: 1240, duration: 0.082, delay: 0.050, volume: 0.024, type: "sine" });
            tone({ frequency: 1420, endFrequency: 1540, duration: 0.060, delay: 0.105, volume: 0.014, type: "sine" });
            return;
        }
        if (kind === "notification") {
            tone({ frequency: 880, endFrequency: 1040, duration: 0.042, volume: 0.014, type: "sine" });
            tone({ frequency: 1220, endFrequency: 1380, duration: 0.060, delay: 0.036, volume: 0.010, type: "sine" });
            return;
        }
        if (kind === "warning") {
            tone({ frequency: 330, endFrequency: 280, duration: 0.055, volume: 0.022, type: "triangle" });
            tone({ frequency: 470, endFrequency: 390, duration: 0.070, delay: 0.050, volume: 0.016, type: "triangle" });
            return;
        }
        if (kind === "error") {
            tone({ frequency: 250, endFrequency: 200, duration: 0.075, volume: 0.030, type: "triangle" });
            tone({ frequency: 190, endFrequency: 150, duration: 0.090, delay: 0.062, volume: 0.024, type: "sawtooth" });
            return;
        }
        if (kind === "danger") {
            tone({ frequency: 240, endFrequency: 180, duration: 0.080, volume: 0.032, type: "triangle" });
            tone({ frequency: 320, endFrequency: 210, duration: 0.090, delay: 0.070, volume: 0.020, type: "sawtooth" });
            return;
        }
        if (kind === "export-ready") {
            tone({ frequency: 520, endFrequency: 620, duration: 0.040, volume: 0.015, type: "triangle" });
            tone({ frequency: 760, endFrequency: 940, duration: 0.060, delay: 0.040, volume: 0.018, type: "sine" });
            tone({ frequency: 1080, endFrequency: 1320, duration: 0.080, delay: 0.088, volume: 0.020, type: "sine" });
            return;
        }
        if (kind === "toast") {
            tone({ frequency: 620, duration: 0.050, volume: 0.022 });
            tone({ frequency: 880, duration: 0.070, delay: 0.055, volume: 0.024 });
            return;
        }
        if (kind === "critical") {
            tone({ frequency: 260, duration: 0.070, volume: 0.032, type: "triangle" });
            tone({ frequency: 190, duration: 0.090, delay: 0.075, volume: 0.028, type: "triangle" });
            return;
        }
        tone({ frequency: 520, duration: 0.040, volume: 0.018 });
        tone({ frequency: 680, duration: 0.040, delay: 0.035, volume: 0.014 });
    };

    const detectToastSound = (title = "", message = "", kind = "success") => {
        const text = `${String(title)} ${String(message)}`.toLowerCase();
        if (kind === "danger") return "danger";
        if (/\b(payment|to'lov|оплат)\b/.test(text) && /\b(created|completed|success|saved|imported|confirmed|downloaded|generated|ready|processed)\b/.test(text)) {
            return "payment-success";
        }
        if (/\b(export|csv|xlsx|pdf|download)\b/.test(text) && /\b(ready|copied|downloaded|generated|exported|checked)\b/.test(text)) {
            return "export-ready";
        }
        if (/\b(notification|alert|reminder|bildirish|уведомл|ogohlant)\b/.test(text) && /\b(created|updated|pinned|unpinned|closed|resolved|ready|queued)\b/.test(text)) {
            return "notification";
        }
        if (/\b(failed|error|could not|not created|not updated|save failed|request failed)\b/.test(text)) {
            return kind === "warning" ? "warning" : "error";
        }
        if (kind === "warning") return "warning";
        if (kind === "success") return "success";
        if (kind === "info") return "toast";
        return "toast";
    };

    const updateSoundControls = () => {
        root.dataset.sound = soundEnabled ? "on" : "off";
        const lang = storage.getItem("hydroflow-lang") || "en";
        document.querySelectorAll("[data-sound-toggle]").forEach((button) => {
            button.classList.toggle("is-active", soundEnabled);
            button.setAttribute("aria-pressed", String(soundEnabled));
        });
        document.querySelectorAll("[data-sound-icon]").forEach((icon) => {
            icon.textContent = soundEnabled ? "volume_up" : "volume_off";
        });
        document.querySelectorAll("[data-sound-title]").forEach((label) => {
            label.textContent = translateValue(soundEnabled ? "Sound on" : "Sound off", lang);
        });
        document.querySelectorAll("[data-sound-state]").forEach((label) => {
            label.textContent = translateValue(soundEnabled ? "On" : "Off", lang);
        });
    };

    const setSoundEnabled = (enabled, { notify = true, preview = true } = {}) => {
        soundEnabled = Boolean(enabled);
        storage.setItem(soundStorageKey, soundEnabled ? "on" : "off");
        updateSoundControls();
        if (soundEnabled && preview) playSound("toggle");
        if (notify) {
            const lang = storage.getItem("hydroflow-lang") || "en";
            const message = soundEnabled ? "Audio feedback enabled." : "Audio feedback muted.";
            toast(translateValue(soundEnabled ? "Sound on" : "Sound off", lang), translateValue(message, lang), "info", { sound: false });
        }
    };

    window.HydroFlowPlaySound = playSound;
    const toast = (title, message = "", kind = "success", options = {}) => {
        if (!toastRegion) return;
        if (options.sound !== false) playSound(options.sound || detectToastSound(title, message, kind));
        const key = normalizeText(`${title}|${message}|${kind}`);
        const existing = activeToasts.get(key);
        if (existing?.item?.isConnected) {
            window.clearTimeout(existing.timeout);
            existing.item.classList.remove("is-bumped");
            existing.item.offsetHeight;
            existing.item.classList.add("is-bumped");
            existing.timeout = window.setTimeout(() => {
                existing.item.style.opacity = "0";
                existing.item.style.transform = "translateY(8px)";
                window.setTimeout(() => {
                    existing.item.remove();
                    activeToasts.delete(key);
                }, 180);
            }, 1800);
            return;
        }
        const item = document.createElement("div");
        item.className = "app-toast";
        item.dataset.toastKind = kind;
        const icon = document.createElement("span");
        icon.className = "material-symbols-outlined toast-icon";
        icon.textContent = toastIcons[kind] || toastIcons.success;
        const content = document.createElement("div");
        const heading = document.createElement("strong");
        heading.textContent = title;
        const body = document.createElement("span");
        body.textContent = message;
        content.append(heading, body);
        item.append(icon, content);
        toastRegion.appendChild(item);
        const timeout = window.setTimeout(() => {
            item.style.opacity = "0";
            item.style.transform = "translateY(8px)";
            window.setTimeout(() => {
                item.remove();
                activeToasts.delete(key);
            }, 180);
        }, 2600);
        activeToasts.set(key, { item, timeout });
    };

    window.HydroFlowToast = toast;

    const updateChartsForTheme = (theme) => {
        if (!window.Chart?.instances) return;
        const isDark = theme === "dark";
        const textColor = isDark ? "#8B90A0" : "#3f484c";
        const gridColor = isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(112,120,125,0.15)";
        const tooltipBg = isDark ? "#1A1D27" : "#171c1f";
        const tooltipText = isDark ? "#F0F2F8" : "#ffffff";
        const darkDatasetColors = [
            "rgba(79, 142, 247, 0.78)",
            "rgba(61, 214, 140, 0.58)",
            "rgba(245, 166, 35, 0.64)",
            "rgba(247, 95, 95, 0.62)",
        ];
        Object.values(window.Chart.instances).forEach((chart) => {
            const options = chart.options || {};
            options.color = textColor;
            if (options.plugins?.legend?.labels) options.plugins.legend.labels.color = textColor;
            if (options.plugins?.tooltip) {
                options.plugins.tooltip.backgroundColor = tooltipBg;
                options.plugins.tooltip.titleColor = tooltipText;
                options.plugins.tooltip.bodyColor = tooltipText;
                options.plugins.tooltip.borderColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(112,120,125,0.18)";
                options.plugins.tooltip.borderWidth = 1;
            }
            Object.values(options.scales || {}).forEach((scale) => {
                scale.ticks = { ...(scale.ticks || {}), color: textColor };
                if (scale.grid && scale.grid.display !== false) scale.grid.color = gridColor;
            });
            chart.data?.datasets?.forEach((dataset, index) => {
                if (!dataset._hydroflowLightBackground) {
                    dataset._hydroflowLightBackground = dataset.backgroundColor;
                    dataset._hydroflowLightBorder = dataset.borderColor;
                    dataset._hydroflowLightHover = dataset.hoverBackgroundColor;
                }
                // Per-slice colors (pie: one color per payment channel) mean something: keep them and
                // only match the slice separators to the panel.
                if (Array.isArray(dataset._hydroflowLightBackground)) {
                    dataset.borderColor = isDark ? "#121823" : "#FFFFFF";
                    return;
                }
                dataset.backgroundColor = isDark ? darkDatasetColors[index % darkDatasetColors.length] : dataset._hydroflowLightBackground;
                dataset.borderColor = isDark ? "rgba(255,255,255,0.12)" : dataset._hydroflowLightBorder;
                dataset.hoverBackgroundColor = isDark ? darkDatasetColors[index % darkDatasetColors.length].replace(/0\.\d+\)/, "0.95)") : dataset._hydroflowLightHover;
            });
            chart.update("none");
        });
    };

    let chartThemeTimer = null;
    let instantThemeTimer = null;
    const setThemeClass = (theme, options = {}) => {
        root.classList.toggle("dark", theme === "dark");
        root.classList.toggle("light", theme !== "dark");
        root.dataset.theme = theme === "dark" ? "dark" : "light";
        root.style.colorScheme = theme === "dark" ? "dark" : "light";
        document.querySelector("[data-theme-label]")?.replaceChildren(document.createTextNode(theme === "dark" ? "Dark" : "Light"));
        storage.setItem("hydroflow-theme", theme);
        window.clearTimeout(chartThemeTimer);
        if (options.deferCharts) {
            chartThemeTimer = window.setTimeout(() => updateChartsForTheme(theme), 80);
        } else {
            updateChartsForTheme(theme);
        }
    };

    const applyTheme = (theme, options = {}) => {
        if (!options.instant) {
            setThemeClass(theme);
            return;
        }
        window.clearTimeout(instantThemeTimer);
        root.classList.add("theme-switching-instant");
        setThemeClass(theme, { deferCharts: true });
        instantThemeTimer = window.setTimeout(() => {
            root.classList.remove("theme-switching-instant");
        }, 90);
    };

    window.HydroFlowUpdateChartsForTheme = updateChartsForTheme;

    const initialTheme = storage.getItem("hydroflow-theme") || "light";
    applyTheme(initialTheme);

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => button.addEventListener("click", () => {
        const next = root.classList.contains("dark") ? "light" : "dark";
        playSound("soft-click");
        applyTheme(next, { instant: true });
        const lang = storage.getItem("hydroflow-lang") || "en";
        const modeMessage = {
            en: `${next === "dark" ? "Dark" : "Light"} mode enabled.`,
            ru: `${next === "dark" ? "Тёмная" : "Светлая"} тема включена.`,
            uz: `${next === "dark" ? "Qorong'i" : "Yorug'"} mavzu yoqildi.`,
        };
        window.setTimeout(() => {
            toast(translateValue("Theme updated", lang), modeMessage[lang] || modeMessage.en);
        }, 120);
    }));

    // announce: tell listeners the language changed. A sync after rendering new content keeps the
    // language, so it must not announce: listeners re-render (some reopen their window) and take
    // hundreds of milliseconds, which made windows jump and their sound play twice.
    const applyLanguage = (lang, { announce = true } = {}) => {
        const safeLang = languageOrder.includes(lang) ? lang : "en";
        root.lang = safeLang;
        document.querySelectorAll("[data-lang-label]").forEach((label) => label.replaceChildren(document.createTextNode(safeLang.toUpperCase())));
        document.querySelectorAll("[data-lang-option]").forEach((option) => {
            const active = option.dataset.langOption === safeLang;
            option.classList.toggle("is-active", active);
            option.setAttribute("aria-checked", String(active));
        });
        applyTranslations(safeLang);
        storage.setItem("hydroflow-lang", safeLang);
        updateSoundControls();
        if (announce) document.dispatchEvent(new CustomEvent("hydroflow:language-changed", { detail: { lang: safeLang } }));
    };

    window.HydroFlowApplyLanguage = applyLanguage;
    window.HydroFlowSyncLocale = () => applyLanguage(storage.getItem("hydroflow-lang") || "en", { announce: false });

    applyLanguage(storage.getItem("hydroflow-lang") || "en");

    updateSoundControls();

    document.querySelectorAll("[data-sound-toggle]").forEach((button) => button.addEventListener("click", () => {
        setSoundEnabled(!soundEnabled);
    }));

    reducedMotionQuery?.addEventListener?.("change", (event) => {
        if (storage.getItem(soundStorageKey)) return;
        soundEnabled = !event.matches;
        updateSoundControls();
    });

    document.addEventListener("click", (event) => {
        const target = event.target.closest("button, a, [role='button']");
        if (!target || target.closest("[data-sound-toggle]")) return;
        if (!target.dataset.soundKind) return;
        playSound(target.dataset.soundKind);
    }, true);

    document.addEventListener("pointerenter", (event) => {
        const target = event.target.closest?.("[data-sound-hover]");
        if (!target) return;
        playSound("hover");
    }, true);

    const searchSoundSelector = "[data-sound-search]";
    document.addEventListener("focusin", (event) => {
        const input = event.target.closest?.(searchSoundSelector);
        if (!input) return;
        playSound("search-focus");
    });
    document.addEventListener("input", (event) => {
        const input = event.target.closest?.(searchSoundSelector);
        if (!input) return;
        playSound("search-input");
    }, true);

    const closeLanguageMenus = () => {
        document.querySelectorAll("[data-lang-menu]").forEach((menu) => {
            menu.classList.remove("is-open");
            menu.querySelector("[data-lang-toggle]")?.setAttribute("aria-expanded", "false");
            menu.querySelector("[data-lang-menu-panel]")?.classList.add("hidden");
        });
    };

    document.querySelectorAll("[data-lang-toggle]").forEach((button) => button.addEventListener("click", (event) => {
        event.stopPropagation();
        const menu = button.closest("[data-lang-menu]");
        const willOpen = !menu?.classList.contains("is-open");
        closeLanguageMenus();
        if (!menu || !willOpen) return;
        menu.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        menu.querySelector("[data-lang-menu-panel]")?.classList.remove("hidden");
    }));

    document.querySelectorAll("[data-lang-option]").forEach((option) => option.addEventListener("click", (event) => {
        event.stopPropagation();
        const next = option.dataset.langOption || "en";
        playSound("soft-click");
        applyLanguage(next);
        closeLanguageMenus();
        toast(translateValue("Language changed", next), next === "uz" ? "O'zbek tili yoqildi." : next === "ru" ? "Русский язык включен." : "English interface selected.");
    }));

    document.addEventListener("click", (event) => {
        if (!event.target.closest("[data-lang-menu]")) closeLanguageMenus();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeLanguageMenus();
    });

    const sidebar = document.querySelector("[data-sidebar]");
    const sidebarToggle = document.querySelector("[data-sidebar-open]");
    const mobileBackdrop = document.querySelector("[data-mobile-sidebar-backdrop]");
    const openSidebar = () => {
        sidebar?.classList.add("is-open");
        mobileBackdrop?.classList.remove("hidden");
        document.documentElement.classList.add("app-sidebar-open");
        sidebarToggle?.setAttribute("aria-expanded", "true");
    };
    const closeSidebar = () => {
        if (!sidebar?.classList.contains("is-open")) return;
        sidebar.classList.remove("is-open");
        mobileBackdrop?.classList.add("hidden");
        document.documentElement.classList.remove("app-sidebar-open");
        sidebarToggle?.setAttribute("aria-expanded", "false");
    };

    sidebarToggle?.addEventListener("click", openSidebar);
    mobileBackdrop?.addEventListener("click", closeSidebar);
    // Links navigate and buttons open modals or drawers; the overlay menu should get out of the way either way.
    // Capture phase: the shared overlay opener stops propagation of clicks on [data-modal-open] buttons.
    document.addEventListener("click", (event) => {
        if (sidebar?.contains(event.target) && event.target.closest("a, button")) closeSidebar();
    }, true);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeSidebar();
    });
    // The full sidebar is always visible on wide screens, so a menu left open on a narrow window must not linger.
    window.matchMedia?.("(min-width: 1280px)").addEventListener?.("change", (event) => {
        if (event.matches) closeSidebar();
    });

    const detailsDrawer = document.getElementById("details-drawer");
    const statusDotClass = (status) => {
        const value = String(status || "").toLowerCase();
        if (value.includes("critical") || value.includes("alert") || value.includes("overdue")) return "dot-critical";
        if (value.includes("maintenance") || value.includes("pending") || value.includes("warning") || value.includes("review")) return "dot-warning";
        if (value.includes("info")) return "dot-info";
        return "dot-operational";
    };

    // Drawer context comes only from backend rows: alerts and assignments for the complex,
    // audit events for the owner/complex. Fields without a data source show "Not set".
    const activeAlertsForComplex = (complexId) => (Array.isArray(billingData.systemAlerts) ? billingData.systemAlerts : [])
        .filter((alert) => complexId && alert.complexId === complexId && alert.status !== "resolved");
    const assignedTechnicianForComplex = (complexId) => {
        const assigned = activeAlertsForComplex(complexId).find((item) => String(item.assignedTo || "").trim());
        return assigned ? assigned.assignedTo : "";
    };
    const recentAuditEventsFor = (data) => {
        const ownerId = data.ownerBackendId ? `owner-${data.ownerBackendId}` : "";
        const complexId = !ownerId && data.complexBackendId ? `complex-${data.complexBackendId}` : "";
        if (!ownerId && !complexId) return [];
        return (Array.isArray(billingData.auditEvents) ? billingData.auditEvents : [])
            .filter((event) => (ownerId && event.ownerId === ownerId) || (complexId && event.complexId === complexId))
            .slice(0, 5);
    };

    const fillDetails = (data) => {
        if (!detailsDrawer || !data) return;
        window.HydroFlowSyncLocale?.();
        detailsDrawer.dataset.ownerBackendId = data.ownerBackendId || "";
        detailsDrawer.dataset.apartmentBackendId = data.apartmentBackendId || "";
        detailsDrawer.dataset.buildingBackendId = data.buildingBackendId || "";
        detailsDrawer.dataset.complexBackendId = data.complexBackendId || "";
        detailsDrawer.dataset.alertBackendId = data.alertBackendId || "";
        detailsDrawer.dataset.notificationBackendId = data.notificationBackendId || "";
        detailsDrawer.querySelector("#details-title").textContent = data.title;
        detailsDrawer.querySelector("[data-detail-subtitle]").textContent = data.subtitle;
        detailsDrawer.querySelector("[data-detail-status]").textContent = data.status;
        detailsDrawer.querySelector("[data-detail-status-label]").textContent = data.status;
        detailsDrawer.querySelector("[data-detail-debt]").textContent = data.debt;
        detailsDrawer.querySelector("[data-detail-payment]").textContent = data.lastPayment;
        detailsDrawer.querySelector("[data-detail-health]").textContent = data.health;
        detailsDrawer.querySelector("[data-detail-alert]").textContent = data.alerts;
        detailsDrawer.querySelector("[data-detail-owner]").textContent = data.owner || t("Not set");
        detailsDrawer.querySelector("[data-detail-tech]").textContent = data.technician || t("Unassigned");
        detailsDrawer.querySelector("[data-detail-sla]").textContent = data.sla || t("Not set");
        const activityTarget = detailsDrawer.querySelector("[data-detail-activity]");
        if (activityTarget) {
            const events = recentAuditEventsFor(data);
            activityTarget.innerHTML = events.length
                ? events.map((event) => `<div><time>${escapeHtml(event.time)}</time><p>${escapeHtml(event.title)}${event.message ? ` — ${escapeHtml(event.message)}` : ""}</p></div>`).join("")
                : `<div><p>${escapeHtml(t("No recent activity"))}</p></div>`;
        }
        const paymentsTarget = detailsDrawer.querySelector("[data-detail-payments]");
        if (paymentsTarget && Array.isArray(data.payments)) {
            paymentsTarget.innerHTML = data.payments.map((payment) => `
                <div class="mini-row">
                    <span>${payment.method}</span>
                    <strong>${payment.amount}</strong>
                    <time>${payment.date}</time>
                </div>
            `).join("");
        }
        const dot = detailsDrawer.querySelector("[data-detail-status-dot]");
        if (dot) dot.className = `status-dot ${statusDotClass(data.status)}`;
    };

    const detailsFromResident = (resident) => {
        if (!resident) return null;
        const complex = getComplexById(resident.complexId);
        const payments = getResidentTransactions(resident.id)
            .slice()
            .sort((a, b) => dateValue(b.date) - dateValue(a.date))
            .map((payment) => ({
                method: payment.method,
                amount: formatBillingUzs(payment.amount),
                date: payment.date,
            }));
        const isDebtor = resident.status === "debtor" || resident.balance < 0;
        return {
            title: resident.name,
            subtitle: `${resident.apartment} · ${complex?.name || "Residential unit"}`,
            status: isDebtor ? "Overdue" : "Paid",
            debt: formatBillingUzs(resident.balance),
            lastPayment: resident.lastPayment,
            health: isDebtor ? "Debt" : "Paid",
            alerts: isDebtor ? "Outstanding balance is active. Send reminder before escalation." : "No active billing alerts.",
            owner: resident.name,
            payments: payments.length ? payments : [{ method: "No payments", amount: "0 UZS", date: "" }],
            ownerBackendId: resident.ownerBackendId || resident.backendId || "",
            apartmentBackendId: resident.apartmentBackendId || "",
            buildingBackendId: resident.buildingBackendId || "",
            complexBackendId: resident.complexBackendId || "",
        };
    };

    const detailsFromComplex = (complex) => {
        if (!complex) return null;
        const latest = complex.transactions.slice().sort((a, b) => dateValue(b.date) - dateValue(a.date))[0];
        const alerts = activeAlertsForComplex(complex.id);
        return {
            title: complex.name,
            subtitle: `${complex.sector} · ${complex.units} units`,
            status: complex.risk === "Critical" ? "Critical" : complex.risk === "Medium Risk" ? "Maintenance" : "Operational",
            debt: formatBillingUzs(complex.debt),
            lastPayment: latest?.date || t("Not set"),
            health: `${complex.health}%`,
            alerts: alerts.length ? `${alerts.length} · ${alerts[0].title}` : t("No active alerts"),
            technician: assignedTechnicianForComplex(complex.id),
            payments: complex.transactions.slice(0, 3).map((payment) => ({
                method: payment.method,
                amount: formatBillingUzs(payment.amount),
                date: payment.date,
            })),
            complexBackendId: complex.backendId || "",
        };
    };

    const detailsFromTrigger = (button) => {
        if (!button || button.matches("[data-apartment-details]")) return null;
        const row = button.closest("tr");
        const transactionId = row?.dataset.transactionId;
        if (transactionId) {
            const transaction = billingData.transactions.find((item) => item.id === transactionId);
            const resident = getResidentById(transaction?.residentId);
            const complex = getComplexById(transaction?.complexId);
            if (transaction && resident) {
                return {
                    title: resident.name,
                    subtitle: `${transaction.id.toUpperCase()} · ${transaction.type} · ${complex?.name || ""}`.trim(),
                    status: transaction.status,
                    debt: formatBillingUzs(resident.balance),
                    lastPayment: transaction.date,
                    health: resident.status === "debtor" ? "Debt" : "Paid",
                    alerts: transaction.status === "Pending" ? "Payment is waiting for provider settlement." : "Payment is confirmed in local transaction log.",
                    owner: resident.name,
                    payments: [{ method: transaction.method, amount: formatBillingUzs(transaction.amount), date: transaction.date }],
                    ownerBackendId: resident.ownerBackendId || resident.backendId || "",
                    apartmentBackendId: resident.apartmentBackendId || "",
                    buildingBackendId: resident.buildingBackendId || "",
                    complexBackendId: resident.complexBackendId || "",
                };
            }
        }
        const residentId = row?.dataset.residentId || button.closest("[data-resident-card]")?.dataset.residentId;
        const residentDetails = detailsFromResident(getResidentById(residentId));
        if (residentDetails) return residentDetails;
        const districtId = row?.dataset.districtId || button.closest("[data-complex-id]")?.dataset.complexId;
        const complexDetails = detailsFromComplex(getComplexStats().find((complex) => complex.id === districtId));
        if (complexDetails) return complexDetails;
        return null;
    };

    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-detail-open]");
        if (!button) return;
        const data = detailsFromTrigger(button);
        if (!data) return;
        fillDetails(data);
        openOverlayById("details-drawer");
    });

    const confirmModal = document.getElementById("confirm-modal");
    let confirmTarget = null;
    const openConfirm = (button) => {
        if (!confirmModal || !button) return;
        confirmTarget = button;
        const lang = storage.getItem("hydroflow-lang") || "en";
        const title = button.dataset.confirmAction === "reset-filters" ? "Reset filters?" : "Close this critical alert?";
        const message = button.dataset.confirmAction === "reset-filters"
            ? "This will restore default district, status and period filters."
            : "The alert will be marked as resolved in this prototype session.";
        playSound(button.dataset.confirmAction === "close-critical-alert" ? "critical" : "modal-open");
        confirmModal.querySelector("#confirm-title").textContent = translateValue(title, lang);
        confirmModal.querySelector("[data-confirm-message]").textContent = message;
        confirmModal.classList.remove("hidden");
        confirmModal.classList.add("flex", "is-open");
        confirmModal.setAttribute("aria-hidden", "false");
        document.querySelector("[data-overlay-backdrop]")?.classList.remove("hidden");
        requestAnimationFrame(() => document.querySelector("[data-overlay-backdrop]")?.classList.add("is-visible"));
    };

    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-confirm-action]");
        if (!button || button.dataset.confirmed === "true") return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openConfirm(button);
    }, true);

    confirmModal?.querySelector("[data-confirm-cancel]")?.addEventListener("click", () => {
        confirmModal.classList.add("hidden");
        confirmModal.classList.remove("flex", "is-open");
        confirmModal.setAttribute("aria-hidden", "true");
        confirmTarget = null;
    });

    confirmModal?.querySelector("[data-confirm-submit]")?.addEventListener("click", async () => {
        const target = confirmTarget;
        confirmModal.classList.add("hidden");
        confirmModal.classList.remove("flex", "is-open");
        confirmModal.setAttribute("aria-hidden", "true");
        if (!target) return;
        target.dataset.confirmed = "true";
        if (target.dataset.confirmAction === "close-critical-alert") {
            const item = target.closest(".notification-item");
            try {
                await resolveNotificationItem(item);
                const lang = storage.getItem("hydroflow-lang") || "en";
                toast(translateValue("Alert closed", lang), "The critical alert was moved to the audit timeline.", "success");
            } catch (error) {
                if (item) {
                    item.dataset.read = "true";
                    item.classList.remove("critical-pulse");
                    item.classList.add("opacity-60");
                }
                updateNotifications();
                const lang = storage.getItem("hydroflow-lang") || "en";
                toast(
                    translateValue("Alert closed", lang),
                    error.message || "The critical alert was marked as resolved only in this browser session.",
                    "warning",
                );
            }
        } else {
            target.click();
        }
        window.setTimeout(() => {
            target.dataset.confirmed = "false";
            confirmTarget = null;
        }, 0);
    });

    const pinnedNotificationKey = "hydroflow-pinned-notifications";
    const visibleNotificationState = (value) => {
        const normalized = String(value || "").trim();
        return normalized === "Created from dashboard" ? "" : normalized;
    };
    const translateNotificationTitle = (value) => {
        const normalized = String(value || "").trim();
        if (!normalized) return "";
        if (normalized.startsWith("Reminder for ")) {
            return `${t("Reminder for")} ${normalized.slice("Reminder for ".length)}`.trim();
        }
        if (normalized.startsWith("Resident follow-up: ")) {
            return `${t("Resident follow-up:")} ${normalized.slice("Resident follow-up: ".length)}`.trim();
        }
        return t(normalized);
    };
    const translateNotificationMessage = (value) => {
        const normalized = String(value || "").trim();
        if (!normalized) return "";
        if (normalized.startsWith("Outstanding balance reminder for apartment ")) {
            return `${t("Outstanding balance reminder for apartment")} ${normalized.slice("Outstanding balance reminder for apartment ".length)}`.trim();
        }
        if (normalized.startsWith("Assigned to ")) {
            return `${t("Assigned to")} ${normalized.slice("Assigned to ".length)}`.trim();
        }
        return t(normalized);
    };
    const translateNotificationAction = (value) => {
        const normalized = String(value || "").trim();
        return normalized ? t(normalized) : "";
    };
    const animateResolvedNotification = (item, onDone) => {
        if (!item) {
            onDone?.();
            return;
        }
        if (item.dataset.resolving === "true") return;
        const notificationId = item.dataset.notificationId || "";
        if (notificationId) {
            const currentPinned = getPinnedNotificationIds().filter((id) => id !== notificationId);
            savePinnedNotificationIds(currentPinned);
        }
        item.dataset.resolving = "true";
        const height = item.offsetHeight || 0;
        item.style.maxHeight = `${height}px`;
        item.style.overflow = "hidden";
        item.style.willChange = "transform, opacity, max-height, margin, padding";
        window.requestAnimationFrame(() => {
            item.classList.add("is-resolving");
            item.style.maxHeight = "0px";
        });
        window.setTimeout(() => {
            item.remove();
            updateNotifications();
            onDone?.();
        }, 380);
    };
    const resolveNotificationItem = async (item) => {
        if (!item || item.dataset.resolving === "true") return null;
        const notificationBackendId = item.dataset.notificationBackendId || "";
        const alertBackendId = item.dataset.alertBackendId || "";
        const payload = await postPortalJson("/api/system-alerts/configure/", {
            mode: "resolve",
            alert_id: alertBackendId,
            notification_id: notificationBackendId,
        });
        if (payload.portalData) {
            rehydrateFromPortalData(payload.portalData);
        } else {
            await refreshPortalDataSnapshot();
            if (payload.warning) console.warn(payload.warning);
        }
        animateResolvedNotification(item, () => {
            serverListControllers.alerts?.refresh?.();
            serverListControllers.audit?.refresh?.();
        });
        return payload;
    };
    const getPinnedNotificationIds = () => {
        try {
            const ids = JSON.parse(storage.getItem(pinnedNotificationKey) || "[]");
            return Array.isArray(ids) ? ids : [];
        } catch {
            return [];
        }
    };
    const savePinnedNotificationIds = (ids) => {
        storage.setItem(pinnedNotificationKey, JSON.stringify(Array.from(new Set(ids)).slice(0, 8)));
    };
    const setNotificationPinnedState = (item, pinned) => {
        const button = item?.querySelector("[data-notification-pin]");
        item.dataset.pinned = String(Boolean(pinned));
        item.classList.toggle("is-pinned", Boolean(pinned));
        if (button) {
            button.setAttribute("aria-pressed", String(Boolean(pinned)));
            button.setAttribute("aria-label", pinned ? t("Pinned") : t("Pin"));
            const icon = button.querySelector(".material-symbols-outlined");
            const label = button.querySelector(".notification-pin-label");
            if (icon) icon.textContent = pinned ? "keep_off" : "keep";
            if (label) label.textContent = pinned ? t("Pinned") : t("Pin");
        }
    };
    const placeNotificationAfterGroup = (list, item, groupName) => {
        const group = list?.querySelector(`[data-notification-group="${groupName}"]`);
        if (!list || !item || !group) return;
        let cursor = group.nextElementSibling;
        let anchor = group;
        while (cursor && !cursor.matches("[data-notification-group]")) {
            if (cursor.matches?.(".notification-item") && cursor !== item) anchor = cursor;
            cursor = cursor.nextElementSibling;
        }
        anchor.insertAdjacentElement("afterend", item);
    };

    // Alerts set for an operator work like tasks: everyone sees them, only the assignee resolves them.
    const myProfileId = () => String(billingData.profile?.id || "");
    const canResolveNotification = (item) => !item.assigneeId || String(item.assigneeId) === myProfileId();
    const isMyOpenNotification = (item) => Boolean(item.assigneeId)
        && String(item.assigneeId) === myProfileId()
        && String(item.status || "").toLowerCase() !== "archived";
    const notificationTaskMeta = (item) => {
        if (!item.assigneeId && !item.createdByName) return "";
        const resolved = String(item.status || "").toLowerCase() === "archived";
        const telegram = { sent: "Sent to Telegram", not_linked: "No Telegram", failed: "Not delivered" }[item.telegramStatus] || "";
        const rows = [
            item.createdByName ? [t("Set by"), item.createdByName] : null,
            item.assigneeId ? [t("Assigned to"), `${item.assigneeName || "—"}${String(item.assigneeId) === myProfileId() ? ` (${t("you")})` : ""}`] : null,
            [t("Status"), t(resolved ? "Closed" : "Open")],
            resolved && (item.resolvedBy || item.resolvedAt) ? [t("Resolved by"), [item.resolvedBy, item.resolvedAt].filter(Boolean).join(" · ")] : null,
            telegram ? ["Telegram", t(telegram)] : null,
        ].filter(Boolean);
        return `<dl class="notification-task-meta">${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
    };

    const renderBackendNotifications = () => {
        const list = document.querySelector("[data-notification-list]");
        const notifications = Array.isArray(billingData.notifications) ? billingData.notifications : [];
        if (!list || list.dataset.backendNotificationsRendered === "true") return;
        if (list.dataset.serverList === "alerts") return;
        if (document.querySelector("[data-notification-filter='todo'].is-active")) return;
        if (!notifications.length && !billingData.source) return;
        const groupLabel = (key, label, hidden = false) => `<div class="notification-group-label ${hidden ? "hidden" : ""}" data-notification-group="${key}">${escapeHtml(t(label))}</div>`;
        const severityLabel = (severity) => severity === "critical" ? t("Critical") : severity === "warning" ? t("Warning") : t("Info");
        const actionButtons = (item) => {
            if (!canResolveNotification(item)) return "";
            return `
                <div class="mt-3 flex gap-2">
                    <button class="drawer-action bg-surface-container text-primary" data-notification-resolve type="button">${escapeHtml(translateNotificationAction("Resolve"))}</button>
                </div>
            `;
        };
        const renderItem = (item) => {
            const severity = ["critical", "warning", "info"].includes(item.severity) ? item.severity : "info";
            return `
                <div class="notification-item ${severity === "critical" ? "critical-pulse" : ""} ${isMyOpenNotification(item) ? "is-mine" : ""}"
                    data-notification-id="${escapeHtml(item.id)}"
                    data-notification-backend-id="${escapeHtml(item.backendId || "")}"
                    data-alert-backend-id="${escapeHtml(item.alertBackendId || "")}"
                    data-notification-section="${escapeHtml(item.section || "today")}"
                    data-read="${item.read ? "true" : "false"}"
                    data-pinned="${item.pinned ? "true" : "false"}"
                    data-severity="${escapeHtml(severity)}">
                    <div class="notification-card-head">
                        <p class="severity-badge severity-${escapeHtml(severity)}"><span class="status-dot dot-${severity === "critical" ? "critical" : severity === "warning" ? "warning" : "info"}"></span>${severityLabel(severity)}</p>
                        <div class="notification-card-meta">
                            <time class="text-[10px] text-on-surface-variant">${escapeHtml(item.eventAt || "")}</time>
                            <button aria-label="${escapeHtml(item.pinned ? t("Pinned") : t("Pin"))}" aria-pressed="${item.pinned ? "true" : "false"}" class="notification-pin" data-notification-pin type="button"><span class="material-symbols-outlined">${item.pinned ? "keep_off" : "keep"}</span><span class="notification-pin-label">${escapeHtml(item.pinned ? t("Pinned") : t("Pin"))}</span></button>
                        </div>
                    </div>
                    <p class="text-sm font-bold text-on-surface mt-2">${escapeHtml(translateNotificationTitle(item.title))}</p>
                    <p class="text-xs text-on-surface-variant mt-1">${escapeHtml(translateNotificationMessage(item.message || ""))}</p>
                    ${notificationTaskMeta(item)}
                    <p class="notification-action-state ${visibleNotificationState(item.actionState) && !item.assigneeId ? "" : "hidden"}" data-notification-state>${escapeHtml(translateNotificationAction(visibleNotificationState(item.actionState)))}</p>
                    ${actionButtons(item)}
                </div>
            `;
        };
        const pinned = notifications.filter((item) => item.pinned);
        const today = notifications.filter((item) => !item.pinned && (item.section || "today") === "today");
        const yesterday = notifications.filter((item) => !item.pinned && item.section === "yesterday");
        const older = notifications.filter((item) => !item.pinned && !["today", "yesterday"].includes(item.section || "today"));
        list.innerHTML = [
            groupLabel("pinned", "Pinned", !pinned.length),
            pinned.map(renderItem).join(""),
            groupLabel("today", "Today", !today.length),
            today.map(renderItem).join(""),
            groupLabel("yesterday", "Yesterday", !yesterday.length),
            yesterday.map(renderItem).join(""),
            groupLabel("older", "Older", !older.length),
            older.map(renderItem).join(""),
            `<div class="empty-state ${notifications.length ? "hidden" : ""}" data-notification-empty><span class="material-symbols-outlined">notifications_off</span><div><p>${escapeHtml(t("No hidden alerts"))}</p><span>${escapeHtml(t("Resolved notifications are moved to the activity log."))}</span></div></div>`,
        ].join("");
        list.dataset.backendNotificationsRendered = "true";
    };

    const updateNotifications = () => {
        const items = Array.from(document.querySelectorAll("[data-notification-list] .notification-item"));
        const list = document.querySelector("[data-notification-list]");
        const pinnedIds = getPinnedNotificationIds();
        items.forEach((item) => {
            const actionRow = item.querySelector(".mt-3.flex.gap-2");
            if (!actionRow) return;
            const isResolved = String(item.dataset.status || "").toLowerCase() === "archived";
            actionRow.querySelectorAll("button").forEach((button) => {
                if (!button.matches("[data-notification-resolve]")) button.remove();
            });
            if (!isResolved && !actionRow.querySelector("[data-notification-resolve]")) {
                const resolve = document.createElement("button");
                resolve.className = "drawer-action bg-surface-container text-primary";
                resolve.dataset.notificationResolve = "";
                resolve.type = "button";
                resolve.textContent = translateNotificationAction("Resolve");
                actionRow.appendChild(resolve);
            }
            if (isResolved) {
                actionRow.querySelector("[data-notification-resolve]")?.remove();
            }
        });
        items.forEach((item) => setNotificationPinnedState(item, pinnedIds.includes(item.dataset.notificationId)));
        items
            .filter((item) => item.dataset.pinned !== "true")
            .forEach((item) => placeNotificationAfterGroup(list, item, item.dataset.notificationSection || "today"));
        const pinnedGroup = document.querySelector('[data-notification-group="pinned"]');
        pinnedIds
            .map((id) => items.find((item) => item.dataset.notificationId === id && item.dataset.pinned === "true"))
            .filter(Boolean)
            .reverse()
            .forEach((item) => pinnedGroup?.insertAdjacentElement("afterend", item));
        // The snapshot holds the open alerts; the bell turns red only for alerts set for the signed-in operator.
        const openAlerts = (Array.isArray(billingData.notifications) ? billingData.notifications : [])
            .filter((item) => String(item.status || "").toLowerCase() !== "archived");
        const open = openAlerts.length;
        const mine = openAlerts.filter(isMyOpenNotification).length;
        const lang = storage.getItem("hydroflow-lang") || "en";
        const activeFilter = document.querySelector("[data-notification-filter].is-active")?.dataset.notificationFilter || "all";
        const resolvedVisible = items.filter((item) => String(item.dataset.status || "").toLowerCase() === "archived").length;
        const openLabel = lang === "ru" ? `${open} открытых · ${mine} вам` : lang === "uz" ? `${open} ta ochiq · ${mine} ta sizga` : `${open} open · ${mine} for you`;
        const resolvedLabel = lang === "ru" ? `${resolvedVisible} решено` : lang === "uz" ? `${resolvedVisible} hal qilingan` : `${resolvedVisible} resolved`;
        document.querySelector("[data-notification-count]")?.replaceChildren(
            document.createTextNode(activeFilter === "resolved" ? resolvedLabel : openLabel)
        );
        document.querySelectorAll("[data-notification-dot]").forEach((dot) => {
            dot.classList.toggle("hidden", mine === 0);
        });
        document.querySelectorAll("[data-sidebar-notification-item]").forEach((item) => {
            item.classList.toggle("is-unread", mine > 0);
        });
        let visible = 0;
        items.forEach((item) => {
            const isResolved = String(item.dataset.status || "").toLowerCase() === "archived";
            const show = activeFilter === "all"
                ? !isResolved
                : activeFilter === "resolved"
                    ? isResolved
                    : !isResolved && item.dataset.severity === activeFilter;
            item.classList.toggle("is-filtered", !show);
            if (show) visible += 1;
        });
        document.querySelectorAll("[data-notification-group]").forEach((group) => {
            let hasVisibleItem = false;
            let cursor = group.nextElementSibling;
            while (cursor && !cursor.matches("[data-notification-group]")) {
                if (cursor.matches?.(".notification-item") && !cursor.classList.contains("is-filtered")) hasVisibleItem = true;
                cursor = cursor.nextElementSibling;
            }
            group.classList.toggle("hidden", !hasVisibleItem);
        });
        document.querySelector("[data-notification-empty]")?.classList.toggle("hidden", visible > 0);
    };

    const syncSiteStatistics = () => {
        if (syncAnalyticsDashboard()) return;
        const stats = getSiteStats();
        const t = (key) => translateValue(key, storage.getItem("hydroflow-lang") || "en");
        const labelVariants = (text) => [text, translations[text]?.ru, translations[text]?.uz].filter(Boolean).map((item) => item.toLowerCase());
        const statHostSelector = ".residential-kpi-card, .payment-channel, .debtor-trends-card, .bg-primary-container, [data-card], [data-billing-kpi-card], .bg-surface-container-lowest, .bg-surface-container-low";
        const exactText = (text, selector = "p,h2,h3,h4,span,strong") => {
            const variants = labelVariants(text);
            return Array.from(document.querySelectorAll(selector))
                .find((element) => element.children.length === 0 && variants.includes(element.textContent.trim().toLowerCase()));
        };
        const cardFor = (label) => {
            const labelElement = exactText(label);
            if (labelElement) return labelElement.closest(statHostSelector);
            const variants = labelVariants(label);
            return Array.from(document.querySelectorAll(statHostSelector))
                .find((host) => variants.some((variant) => host.textContent.trim().toLowerCase().includes(variant)));
        };
        const valueNode = (host, label) => {
            if (!host) return null;
            const variants = labelVariants(label);
            const labelElement = Array.from(host.querySelectorAll("p,h2,h3,h4,span,strong"))
                .find((element) => element.children.length === 0 && variants.includes(element.textContent.trim().toLowerCase()));
            const candidates = Array.from(host.querySelectorAll("h2,h3,p,strong"))
                .filter((element) => element !== labelElement)
                .filter((element) => !variants.includes(element.textContent.trim().toLowerCase()))
                .filter((element) => /text-(?:display-sm|[234]xl)|font-black|font-extrabold/.test(element.getAttribute("class") || ""));
            const afterLabel = labelElement
                ? candidates.find((element) => labelElement.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
                : null;
            const numericFallback = Array.from(host.querySelectorAll("h2,h3,p,strong"))
                .filter((element) => element !== labelElement)
                .filter((element) => !variants.includes(element.textContent.trim().toLowerCase()))
                .find((element) => /\d|stable|optimal|review|maintenance/i.test(element.textContent.trim())
                    && /font|text-|display|tracking-tight/i.test(element.getAttribute("class") || ""));
            return afterLabel || candidates[0] || numericFallback || null;
        };
        const supportNode = (host, valueElement) => {
            if (!host) return null;
            const rowSupport = host.querySelector(".kpi-support-row span:first-child");
            if (rowSupport) return rowSupport;
            const small = host.querySelector("small");
            if (small) return small;
            const afterValue = valueElement
                ? Array.from(host.querySelectorAll("div, p, span"))
                    .find((element) => {
                        const text = element.textContent.trim();
                        return element !== valueElement
                            && text
                            && !element.querySelector("h2,h3,p,strong")
                            && Boolean(valueElement.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
                            && /text-xs|text-sm|text-\[|on-surface-variant|text-error|opacity/i.test(element.className);
                    })
                : null;
            return afterValue || null;
        };
        const setStat = (label, value, support = "", progress = null) => {
            const statCardKeys = {
                "Total Complexes": "total-complexes",
                "Active Buildings": "active-buildings",
                "Critical Debt Units": "critical-debt-units",
                "Total Residents": "total-residents",
                "Paid Residents": "paid-residents",
                "Total Debtors": "total-debtors",
                "Outstanding Debt": "outstanding-debt",
            };
            const host = statCardKeys[label]
                ? document.querySelector(`[data-stat-card="${statCardKeys[label]}"]`) || cardFor(label)
                : cardFor(label);
            const valueElement = host?.dataset.statCard ? host.querySelector("h2") : valueNode(host, label);
            if (valueElement) {
                valueElement.dataset.statSynced = "true";
                valueElement.textContent = value;
            }
            if (support) {
                const supportElement = host?.dataset.statCard ? host.querySelector("[data-stat-support]") : supportNode(host, valueElement);
                if (supportElement) {
                    supportElement.dataset.statSynced = "true";
                    supportElement.textContent = support;
                }
            }
            const meter = host?.querySelector(".kpi-progress-meter, .percent-meter");
            if (meter && progress !== null) {
                const valueText = percentValue(progress);
                meter.style.setProperty("--progress", valueText);
                meter.style.setProperty("--occupancy", valueText);
                meter.dataset.value = valueText;
                meter.setAttribute("aria-valuenow", String(Number(progress).toFixed(1)));
                meter.setAttribute("aria-label", `${label} ${valueText}`);
            }
        };
        const paymentsThisMonth = Number(billingData.paymentSummary?.currentMonthPayments || 0);

        setStat("Total Residents", moneyFormatter.format(stats.detailedResidents), t("Total linked resident profiles"));
        setStat("Paid Residents", moneyFormatter.format(stats.detailedPaidResidents), t("Residents with positive or zero balance"));
        setStat("Total Debtors", moneyFormatter.format(stats.detailedDebtors), t("Residents with overdue balance"));
        setStat("Outstanding Debt", formatCompactUzs(stats.detailedDebt), t("Current resident liabilities"));
        setStat("Total Complexes", moneyFormatter.format(stats.totalBuildings), t("All homes connected"));
        const totalComplexesCard = document.querySelector('[data-stat-card="total-complexes"]');
        const supportSpans = totalComplexesCard
            ? Array.from(totalComplexesCard.querySelectorAll(".kpi-support-row span"))
            : [];
        const monthDeltaNode = supportSpans.length > 1 ? supportSpans[supportSpans.length - 1] : null;
        if (monthDeltaNode) {
            monthDeltaNode.dataset.statSynced = "true";
            monthDeltaNode.textContent = `+${moneyFormatter.format(Number(stats.newComplexesThisMonth) || 0)} ${t("new this month")}`.toUpperCase();
        }
        // Residents KPI row: show real counts (apartments / residents / debtors) instead of demo-like derived labels.
        setStat("Active Buildings", moneyFormatter.format(stats.totalUnits), t("Total apartments in system"));
        setStat("Critical Debt Units", moneyFormatter.format(stats.detailedDebtors), t("Residents with overdue balance"));
        setStat("Total Units", moneyFormatter.format(stats.totalUnits));
        setStat("Total Subscribers", moneyFormatter.format(stats.occupiedUnits));
        setStat("Total YTD Payments", formatBillingUzs(stats.totalCollected));
        setStat("Total Debt Burden", formatBillingUzs(stats.totalDebt));
        setStat("Active Debtors", moneyFormatter.format(stats.detailedDebtors));
        // A debt: shown in red with a minus sign, as balances are.
        const outstandingDebt = Number(stats.detailedDebt) || 0;
        setStat("Total Outstanding", outstandingDebt > 0 ? `-${formatBillingUzs(outstandingDebt)}` : formatBillingUzs(0));
        document.querySelectorAll("[data-total-outstanding]").forEach((node) => {
            node.classList.toggle("text-error", outstandingDebt > 0);
            node.classList.toggle("text-on-surface", outstandingDebt <= 0);
        });
        setStat("Payments this month", moneyFormatter.format(paymentsThisMonth));
        document.querySelectorAll("[data-payments-this-month]").forEach((node) => {
            node.textContent = moneyFormatter.format(paymentsThisMonth);
        });
        setStat("Total Complex Usage", `${compactNumber(stats.totalUsageM3)} m³`, `${moneyFormatter.format(stats.totalWaterM3)} water / ${moneyFormatter.format(stats.totalHeatingM3)} heating`);

        const paymentSystems = Array.from(document.querySelectorAll("h3"))
            .find((heading) => heading.textContent.trim().toLowerCase().includes("payment systems"))
            ?.closest(".bg-surface-container-low");
        paymentSystems?.querySelectorAll(".bg-surface-container-lowest").forEach((row) => {
            const name = row.querySelector("p.text-xs")?.textContent.trim();
            const amount = row.querySelector("p.text-lg");
            if (amount && name) amount.innerHTML = `${formatBillingUzs(stats.methodTotals[name] || 0).replace(" UZS", "")} <span class="text-xs font-medium">UZS</span>`;
        });

        document.querySelectorAll(".payment-channel[data-payment-channel]").forEach((channel) => {
            const name = channel.dataset.paymentChannel || "";
            if (!name) return;
            const amount = stats.methodTotals[name] || 0;
            const residentCount = stats.methodResidentCounts?.[name] || 0;
            const amountNode = channel.querySelector("[data-payment-channel-amount]");
            if (amountNode) amountNode.textContent = formatCompactUzs(amount);
            channel.querySelectorAll("[data-payment-channel-count]").forEach((node) => {
                node.textContent = moneyFormatter.format(residentCount);
            });
        });

        const healthList = exactText("Complex Status Health Scores", "h3")?.nextElementSibling;
        if (healthList) {
            const riskClass = (risk) => risk === "Critical" ? "risk-critical" : risk === "Medium Risk" ? "risk-medium" : "risk-low";
            healthList.innerHTML = stats.complexes.map((complex) => `
                <div class="complex-health-row flex items-center justify-between gap-4 p-4 bg-surface-container rounded-lg border border-outline-variant/10 transition-all hover:bg-surface-container-high/45" data-complex-id="${escapeHtml(complex.id)}">
                    <div class="flex items-center gap-4">
                        <div class="kpi-icon-chip kpi-icon-${escapeHtml(complex.tone === "red" ? "red" : complex.tone === "amber" ? "amber" : "blue")}">
                            <span class="material-symbols-outlined" data-icon="${escapeHtml(complex.icon || "apartment")}">${escapeHtml(complex.icon || "apartment")}</span>
                        </div>
                        <div class="min-w-0">
                            <p class="font-bold text-sm">${escapeHtml(complex.name)}</p>
                            <p class="text-xs text-on-surface-variant">${moneyFormatter.format(complex.units)} Units · ${moneyFormatter.format(complex.buildings)} Buildings · ${escapeHtml(complex.sector)}</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-end gap-4 shrink-0">
                        <div class="text-right hidden sm:block">
                            <p class="text-xs font-black text-on-surface">${formatBillingUzs(complex.debt)}</p>
                            <p class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">${complex.debtorResidents} Debt · ${complex.paidResidents} Paid</p>
                        </div>
                        <div class="text-right min-w-[112px]">
                            <div class="percent-meter percent-meter-${escapeHtml(complex.tone)} percent-meter-mini ml-auto" style="--progress: ${complex.health}%;" data-value="${percentValue(complex.health)}" aria-label="${escapeHtml(complex.name)} health ${percentValue(complex.health)}">
                                <span class="percent-meter-track"><span class="percent-meter-fill"></span></span>
                            </div>
                            <p class="text-[10px] font-black text-on-surface-variant mt-1">${percentValue(complex.health)}</p>
                        </div>
                        <span class="risk-badge ${riskClass(complex.risk)}" data-i18n-key="${escapeHtml(complex.risk)}">${escapeHtml(complex.risk)}</span>
                    </div>
                </div>
            `).join("");
        }

        const debtorList = document.querySelector(".debtor-list .space-y-2");
        if (debtorList) {
            const houseDebtRows = stats.complexes.flatMap((complex) => (complex.buildingItems || []).map((building, index) => {
                const apartmentRows = Array.isArray(building.apartments) ? building.apartments : [];
                const fallbackDebt = apartmentRows.reduce((total, apartment) => {
                    const apartmentBalance = Number(apartment.balance || 0);
                    return total + (apartmentBalance < 0 ? Math.abs(apartmentBalance) : 0);
                }, 0);
                const fallbackDebtors = apartmentRows.filter((apartment) => Number(apartment.balance || 0) < 0).length;
                const houseDebt = Number.isFinite(Number(building.debt)) ? Number(building.debt) : fallbackDebt;
                const houseDebtors = Number.isFinite(Number(building.debtorResidents))
                    ? Number(building.debtorResidents)
                    : fallbackDebtors;
                return {
                    id: building.id || `${complex.id}-building-${index}`,
                    name: building.name || `House ${building.number || index + 1}`,
                    debt: houseDebt,
                    debtorResidents: houseDebtors,
                    tone: building.tone || complex.tone || "blue",
                };
            }));
            const totalHouseDebt = houseDebtRows.reduce((sum, house) => sum + Math.max(0, Number(house.debt) || 0), 0);
            const topDebtors = houseDebtRows
                .sort((a, b) => b.debt - a.debt)
                .slice(0, 5);
            const debtorTitle = debtorList.closest(".debtor-list")?.querySelector(".debtor-list-title");
            if (debtorTitle) debtorTitle.textContent = t("Critical Houses (Top 5)");
            debtorList.innerHTML = topDebtors
                .map((house) => {
                    const share = (house.debt / Math.max(totalHouseDebt, 1)) * 100;
                    return `
                        <div class="debtor-row flex items-center justify-between gap-3 p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/5" data-building-id="${escapeHtml(house.id)}">
                            <div class="min-w-0">
                                <span class="block text-xs font-semibold truncate">${escapeHtml(house.name)}</span>
                                <span class="block text-[10px] font-bold text-on-surface-variant">${formatBillingUzs(house.debt)} · ${moneyFormatter.format(house.debtorResidents)} ${escapeHtml(t("debt residents"))}</span>
                            </div>
                            <div class="percent-meter percent-meter-${escapeHtml(house.tone)} percent-meter-row shrink-0" style="--progress: ${Math.min(100, share)}%;" data-value="${percentValue(share)}" aria-label="${escapeHtml(house.name)} debt share ${percentValue(share)}">
                                <span class="percent-meter-track"><span class="percent-meter-fill"></span></span>
                            </div>
                        </div>
                    `;
                }).join("");
        }

        const riskBadge = document.querySelector(".debtor-risk-badge");
        if (riskBadge) {
            const isHighRisk = stats.criticalAlerts > 0 || stats.criticalDebtUnits > 0;
            riskBadge.textContent = isHighRisk ? "High Risk" : stats.activeAlerts ? "Review" : "Stable";
            riskBadge.className = `debtor-risk-badge text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isHighRisk ? "text-error bg-error-container/20" : stats.activeAlerts ? "text-tertiary bg-tertiary-container/20" : "text-secondary bg-secondary-container/20"}`;
        }

        const debtorAction = document.querySelector(".debtor-primary-action");
        if (debtorAction) {
            debtorAction.dataset.exportOpen = "";
            debtorAction.dataset.exportSource = "Debt Letters";
            debtorAction.dataset.exportContext = "debt-letters";
        }
        const debtorSecondaryAction = document.querySelector(".debtor-secondary-action");
        if (debtorSecondaryAction) {
            debtorSecondaryAction.type = "button";
            debtorSecondaryAction.dataset.viewDebtors = "true";
        }

        document.querySelectorAll("[data-value]").forEach((meter) => {
            const value = meter.dataset.value;
            if (!value || !meter.classList.contains("percent-meter")) return;
            meter.style.setProperty("--progress", value);
        });

        if (window.Chart?.getChart) {
            const consumptionChart = window.Chart.getChart(document.getElementById("consumption-chart"));
            if (consumptionChart) {
                consumptionChart.data.labels = stats.complexes.map((complex) => complex.name.replace(/\s+(Residential|Gardens|Towers|Metropolitan).*/i, ""));
                consumptionChart.data.datasets[0].data = billingData.complexes.map((complex) => complex.waterM3);
                consumptionChart.data.datasets[1].data = billingData.complexes.map((complex) => complex.heatingM3);
                consumptionChart.update("none");
            }
        }
    };

    const findSectionHeading = (text, selector = "h3, h4") => Array.from(document.querySelectorAll(selector))
        .find((heading) => heading.textContent.trim().toLowerCase().includes(String(text || "").toLowerCase()));
    const listUrlKey = (name, key) => `${name}_${key}`;
    const readListUrlState = (name, defaults = {}) => {
        const url = new URL(window.location.href);
        return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => {
            const raw = url.searchParams.get(listUrlKey(name, key));
            return [key, raw === null || raw === "" ? fallback : raw];
        }));
    };
    const writeListUrlState = (name, nextState = {}) => {
        const url = new URL(window.location.href);
        Object.entries(nextState).forEach(([key, value]) => {
            const param = listUrlKey(name, key);
            if (value === undefined || value === null || value === "") {
                url.searchParams.delete(param);
            } else {
                url.searchParams.set(param, String(value));
            }
        });
        window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
    };
    const debounce = (fn, delay = 220) => {
        let timer = 0;
        return (...args) => {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => fn(...args), delay);
        };
    };
    const currentGlobalListFilters = () => ({ state: readFilterState(), params: {} });
    const fetchServerList = async (endpoint, params = {}) => {
        const url = new URL(endpoint, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "" || value === "all") return;
            url.searchParams.set(key, value);
        });
        const response = await fetch(url.toString(), {
            cache: "no-store",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
        });
        if (redirectToLoginIfUnauthorized(response)) throw new Error("Authentication required");
        if (!response.ok) throw new Error(`List request failed: ${response.status}`);
        return response.json();
    };
    const escapeAttr = (value) => escapeHtml(value ?? "");
    const tableStatusClass = (value = "") => {
        const key = String(value || "").toLowerCase();
        if (key.includes("critical") || key.includes("overdue") || key.includes("failed")) return "is-critical";
        if (key.includes("pending") || key.includes("warning") || key.includes("planned") || key.includes("medium")) return "is-warning";
        if (key.includes("scheduled") || key.includes("upcoming") || key.includes("progress") || key.includes("review") || key.includes("active")) return "is-info";
        return "is-success";
    };
    const renderTableStatus = (value) => `<span class="table-assigned-status ${tableStatusClass(value)}">${escapeHtml(value)}</span>`;
    const renderResidentCardMarkup = (resident, layout = "card") => {
        const isDebtor = String(resident.status || "").toLowerCase() === "debtor";
        const isPositiveBalance = Number(resident.balance || 0) >= 0;
        const balanceClass = isPositiveBalance ? "is-positive" : "is-negative";
        const balanceIcon = isPositiveBalance ? "verified" : "error";
        const contractTranslationKey = resident.hasContract ? "True" : "False";
        const contractValue = t(contractTranslationKey);
        const contractClass = resident.hasContract ? "is-contract-true" : "is-contract-false";
        const avatar = resident.photo
            ? `<img class="h-12 w-12 rounded-lg object-cover" src="${escapeAttr(resident.photo)}" alt="">`
            : `<div class="h-12 w-12 rounded-lg ${isDebtor ? "bg-error/20 text-error" : "bg-secondary/20 text-secondary"} flex items-center justify-center font-bold text-xl">${escapeHtml(initialsFor(resident.name || "R"))}</div>`;
        if (layout === "flat") {
            return `
                <article class="resident-list-row cursor-pointer"
                    data-resident-card
                    data-resident-id="${escapeAttr(resident.id)}"
                    data-resident-name="${escapeAttr(resident.name || "")}"
                    data-resident-phone="${escapeAttr(resident.phone || "")}"
                    data-resident-apartment-label="${escapeAttr(resident.apartment || "")}"
                    data-resident-building="${escapeAttr(resident.building || "")}"
                    data-resident-complex="${escapeAttr(resident.complex || "")}"
                    data-resident-admin-url="${escapeAttr(resident.adminUrl || "")}"
                    data-resident-status="${escapeAttr(resident.status)}"
                    data-owner-backend-id="${escapeAttr(resident.ownerBackendId || resident.backendId || "")}"
                    data-apartment-backend-id="${escapeAttr(resident.apartmentBackendId || "")}"
                    data-building-backend-id="${escapeAttr(resident.buildingBackendId || "")}"
                    data-complex-backend-id="${escapeAttr(resident.complexBackendId || "")}"
                    data-complex-id="${escapeAttr(resident.complexId || "")}">
                    <div class="resident-list-id">
                        <span>ID</span>
                        <strong>${escapeHtml(String(resident.displayId || resident.ownerBackendId || resident.backendId || ""))}</strong>
                    </div>
                    <div class="resident-list-person">
                        <div>
                            <h4>${escapeHtml(resident.name || "Resident")}</h4>
                            <p>${escapeHtml(resident.complex || "-")}</p>
                        </div>
                    </div>
                    <div class="resident-list-cell resident-list-account">
                        <span data-i18n-key="Personal account">Personal account</span>
                        <strong>${escapeHtml(resident.personalAccount || "—")}</strong>
                    </div>
                    <div class="resident-list-cell">
                        <span data-i18n-key="TG user">TG user</span>
                        ${telegramHandleMarkup(resident, "resident-list-telegram")}
                    </div>
                    <div class="resident-list-cell">
                        <span data-i18n-key="Contract">Contract</span>
                        <strong class="resident-list-pill-wrap"><span class="resident-status-pill ${contractClass}"><span class="resident-status-pill__label" data-i18n-key="${escapeAttr(contractTranslationKey)}">${escapeHtml(contractValue)}</span></span></strong>
                    </div>
                    <div class="resident-list-cell">
                        <span data-i18n-key="House / apartment">House / apartment</span>
                        <strong>${escapeHtml(houseApartmentLabel(resident))}</strong>
                    </div>
                    <div class="resident-list-balance resident-list-balance-panel">
                        <div class="resident-list-balance-main">
                            <span data-i18n-key="Current Balance">Current Balance</span>
                            <strong class="${balanceClass}"><span class="material-symbols-outlined" aria-hidden="true">${balanceIcon}</span>${formatBillingUzs(resident.balance || 0)}</strong>
                        </div>
                        <div class="resident-list-actions">
                            ${resident.ownerBackendId ? `<button aria-label="${escapeAttr(t("Add payment"))}" class="resident-list-action is-payment" data-resident-add-payment title="${escapeAttr(t("Add payment"))}" type="button">
                                <span class="material-symbols-outlined" aria-hidden="true">add_card</span>
                                <span data-i18n-key="Pay">Pay</span>
                            </button>` : ""}
                            <button class="resident-list-action is-history" data-resident-billing-history type="button">
                                <span class="material-symbols-outlined" aria-hidden="true">history</span>
                                <span data-i18n-key="History">History</span>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }
        const actionButton = isDebtor
            ? `<button class="w-full py-2 bg-error text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors" data-reminder-action type="button" data-i18n-key="SEND URGENT REMINDER">SEND URGENT REMINDER</button>`
            : `<button class="w-full py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors" data-resident-billing-history type="button" data-i18n-key="VIEW BILLING HISTORY">VIEW BILLING HISTORY</button>`;
        return `
            <div class="resident-card group cursor-pointer ${isDebtor ? "bg-error-container/30 border-error/20" : "bg-secondary-container/20 border-secondary/10"} border p-5 rounded-xl transition-all hover:shadow-lg relative overflow-hidden"
                data-resident-card
                data-resident-id="${escapeAttr(resident.id)}"
                data-resident-status="${escapeAttr(resident.status)}"
                data-owner-backend-id="${escapeAttr(resident.ownerBackendId || resident.backendId || "")}"
                data-apartment-backend-id="${escapeAttr(resident.apartmentBackendId || "")}"
                data-building-backend-id="${escapeAttr(resident.buildingBackendId || "")}"
                data-complex-backend-id="${escapeAttr(resident.complexBackendId || "")}"
                data-complex-id="${escapeAttr(resident.complexId || "")}">
                <div class="absolute top-0 right-0 w-16 h-16 ${isDebtor ? "bg-error/10" : "bg-secondary/10"} rounded-bl-full flex items-start justify-end p-2 transition-transform group-hover:scale-110">
                    <span class="material-symbols-outlined ${isDebtor ? "text-error" : "text-secondary"} text-[20px]">${isDebtor ? "warning" : "check_circle"}</span>
                </div>
                <div class="flex items-start gap-4 mb-4">
                    ${avatar}
                    <div>
                        <h4 class="font-bold text-on-surface leading-tight">${escapeHtml(resident.name || "Resident")}</h4>
                        <p class="text-xs text-on-surface-variant">${escapeHtml(resident.apartment || "")}</p>
                    </div>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between items-end">
                        <span class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" data-i18n-key="Current Balance">Current Balance</span>
                        <span class="text-xl font-black ${balanceClass}">${formatBillingUzs(resident.balance || 0)}</span>
                    </div>
                    <div class="bg-white/40 p-3 rounded-lg text-[11px] space-y-1.5">
                        <p class="text-on-surface-variant flex justify-between"><span data-i18n-key="Phone:">Phone:</span> <span class="text-on-surface font-semibold">${escapeHtml(resident.phone || "")}</span></p>
                        <p class="text-on-surface-variant flex justify-between"><span data-i18n-key="Last Payment:">Last Payment:</span> <span class="text-on-surface font-semibold">${escapeHtml(resident.lastPayment || "")}</span></p>
                    </div>
                    ${actionButton}
                </div>
            </div>
        `;
    };
    const cloneWithFreshListeners = (element) => {
        if (!element) return null;
        const clone = element.cloneNode(true);
        element.replaceWith(clone);
        return clone;
    };
    const prepareServerTableChrome = (table, config) => {
        if (!table) return null;
        table.dataset.serverPagination = "true";
        table.dataset.serverList = config.name;
        const workspace = table.closest(".table-workspace") || table.closest(".overflow-x-auto") || table;
        let tools = workspace.previousElementSibling?.classList?.contains("table-tools") ? workspace.previousElementSibling : null;
        let pagination = workspace.nextElementSibling?.classList?.contains("table-pagination") ? workspace.nextElementSibling : null;
        let thead = table.querySelector("thead");
        if (tools) tools = cloneWithFreshListeners(tools);
        if (pagination) pagination = cloneWithFreshListeners(pagination);
        if (thead) thead = cloneWithFreshListeners(thead);
        const body = table.querySelector("tbody");
        const selectAll = table.querySelector("[data-select-all]");
        const searchInput = tools?.querySelector(".table-search");
        const headers = Array.from(table.querySelectorAll("thead th")).filter((cell) => !cell.querySelector("[data-select-all]"));
        const updateSelection = () => {
            const selected = Array.from(body?.querySelectorAll("[data-row-select]:checked") || []).length;
            const label = tools?.querySelector("[data-selected-count]");
            if (label) {
                label.dataset.count = selected;
                label.textContent = `${selected} selected`;
            }
        };
        if (selectAll) {
            selectAll.addEventListener("change", (event) => {
                Array.from(body?.querySelectorAll("[data-row-select]") || []).forEach((checkbox) => {
                    if (checkbox.closest("tr")?.classList.contains("hidden")) return;
                    checkbox.checked = event.target.checked;
                });
                updateSelection();
            });
        }
        body?.addEventListener("change", (event) => {
            if (event.target.matches("[data-row-select]")) updateSelection();
        });
        const syncSortIndicators = (ordering) => {
            const key = String(ordering || "");
            headers.forEach((header, index) => {
                const icon = header.querySelector(".table-sort-heading-icon");
                if (!icon) return;
                const map = config.sortMap[index];
                if (!map) {
                    icon.textContent = "unfold_more";
                    return;
                }
                if (key === map) icon.textContent = "arrow_upward";
                else if (key === `-${map}`) icon.textContent = "arrow_downward";
                else icon.textContent = "unfold_more";
            });
        };
        const toggleOrdering = (index) => {
            const sortKey = config.sortMap[index];
            if (!sortKey) return;
            const current = readListUrlState(config.name, { ordering: "" }).ordering;
            const normalized = String(current || "");
            const currentKey = normalized.startsWith("-") ? normalized.slice(1) : normalized;
            const defaultDesc = config.defaultSortDirection?.[sortKey] === "desc";
            const defaultValue = defaultDesc ? `-${sortKey}` : sortKey;
            const reverseValue = defaultDesc ? sortKey : `-${sortKey}`;
            let next = defaultValue;
            if (currentKey === sortKey) {
                if (normalized === defaultValue) next = reverseValue;
                else if (normalized === reverseValue) next = "";
                else next = defaultValue;
            }
            writeListUrlState(config.name, { ordering: next, page: 1 });
            config.load();
        };
        headers.forEach((header, index) => {
            header.addEventListener("click", () => toggleOrdering(index));
            header.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleOrdering(index);
                }
            });
        });
        searchInput?.addEventListener("input", debounce(() => {
            writeListUrlState(config.name, { search: searchInput.value.trim(), page: 1 });
            config.load();
        }));
        tools?.querySelector("[data-table-action='reminders']")?.addEventListener("click", () => {
            document.querySelector("[data-modal-open='notifications-drawer'], [data-drawer-open='notifications-drawer']")?.click();
        });
        pagination?.querySelector("[data-prev-page]")?.addEventListener("click", () => {
            const state = readListUrlState(config.name, { page: "1" });
            writeListUrlState(config.name, { page: Math.max(1, Number(state.page || 1) - 1) });
            config.load();
        });
        pagination?.querySelector("[data-next-page]")?.addEventListener("click", () => {
            const state = readListUrlState(config.name, { page: "1" });
            const totalPages = Number(pagination?.dataset.totalPages || 1);
            writeListUrlState(config.name, { page: Math.min(totalPages, Number(state.page || 1) + 1) });
            config.load();
        });
        return {
            table,
            workspace,
            body,
            tools,
            pagination,
            searchInput,
            selectAll,
            syncSortIndicators,
            updateSelection,
            syncMeta(meta) {
                if (searchInput) searchInput.value = readListUrlState(config.name, { search: "" }).search;
                if (pagination) {
                    pagination.dataset.totalPages = String(meta.pages || 1);
                    const pageLabel = pagination.querySelector("[data-page-label]");
                    if (pageLabel) pageLabel.textContent = `Page ${meta.page} of ${meta.pages}`;
                    const prev = pagination.querySelector("[data-prev-page]");
                    const next = pagination.querySelector("[data-next-page]");
                    if (prev) prev.disabled = Number(meta.page || 1) <= 1;
                    if (next) next.disabled = Number(meta.page || 1) >= Number(meta.pages || 1);
                }
                syncSortIndicators(readListUrlState(config.name, { ordering: "" }).ordering);
                if (selectAll) selectAll.checked = false;
                updateSelection();
                window.HydroFlowSyncLocale?.();
            },
        };
    };
    const ensureDrawerPagination = (host, key) => {
        if (!host) return null;
        let pager = host.querySelector(`[data-drawer-pagination='${key}']`);
        if (pager) return pager;
        pager = document.createElement("div");
        pager.className = "table-pagination mt-4";
        pager.dataset.drawerPagination = key;
        pager.innerHTML = `
            <span class="text-xs font-bold text-on-surface-variant" data-page-label>Page 1 of 1</span>
            <div class="flex gap-2">
                <button class="table-tool-button" data-prev-page type="button">Previous</button>
                <button class="table-tool-button" data-next-page type="button">Next</button>
            </div>
        `;
        host.appendChild(pager);
        return pager;
    };
    const renderNotificationMarkup = (items = []) => {
        const groupLabel = (key, label, hidden = false) => `<div class="notification-group-label ${hidden ? "hidden" : ""}" data-notification-group="${key}">${escapeHtml(t(label))}</div>`;
        const severityLabel = (severity) => severity === "critical" ? t("Critical") : severity === "warning" ? t("Warning") : t("Info");
        const actionButtons = (item) => {
            if (String(item.status || "").toLowerCase() === "archived" || !canResolveNotification(item)) return "";
            return `
                <div class="mt-3 flex gap-2">
                    <button class="drawer-action bg-surface-container text-primary" data-notification-resolve type="button">${escapeHtml(translateNotificationAction("Resolve"))}</button>
                </div>
            `;
        };
        const renderItem = (item) => {
            const severity = ["critical", "warning", "info"].includes(item.severity) ? item.severity : "info";
            const isResolved = String(item.status || "").toLowerCase() === "archived";
            const resolvedBy = String(item.resolvedBy || "").trim();
            const actionStateValue = visibleNotificationState(item.actionState);
            const actionStateText = (() => {
                // A task shows who resolved it in its details below instead.
                if (!actionStateValue || item.assigneeId) return "";
                if (isResolved && resolvedBy) {
                    return `${t("Resolved by")}: ${resolvedBy}`;
                }
                return translateNotificationAction(actionStateValue);
            })();
            const pinButton = isResolved
                ? ""
                : `<button aria-label="${escapeAttr(item.pinned ? t("Pinned") : t("Pin"))}" aria-pressed="${item.pinned ? "true" : "false"}" class="notification-pin" data-notification-pin type="button"><span class="material-symbols-outlined">${item.pinned ? "keep_off" : "keep"}</span><span class="notification-pin-label">${escapeHtml(item.pinned ? t("Pinned") : t("Pin"))}</span></button>`;
            return `
                <div class="notification-item ${severity === "critical" ? "critical-pulse" : ""} ${isMyOpenNotification(item) ? "is-mine" : ""}"
                    data-notification-id="${escapeAttr(item.id)}"
                    data-notification-backend-id="${escapeAttr(item.backendId || "")}"
                    data-alert-backend-id="${escapeAttr(item.alertBackendId || "")}"
                    data-notification-section="${escapeAttr(item.section || "today")}"
                    data-read="${item.read ? "true" : "false"}"
                    data-pinned="${item.pinned ? "true" : "false"}"
                    data-status="${escapeAttr(item.status || "unread")}"
                    data-severity="${escapeAttr(severity)}">
                    <div class="notification-card-head">
                        <p class="severity-badge severity-${escapeAttr(severity)}"><span class="status-dot dot-${severity === "critical" ? "critical" : severity === "warning" ? "warning" : "info"}"></span>${severityLabel(severity)}</p>
                        <div class="notification-card-meta">
                            <time class="text-[10px] text-on-surface-variant">${escapeHtml(item.eventAt || "")}</time>
                            ${pinButton}
                        </div>
                    </div>
                    <p class="text-sm font-bold text-on-surface mt-2">${escapeHtml(translateNotificationTitle(item.title))}</p>
                    <p class="text-xs text-on-surface-variant mt-1">${escapeHtml(translateNotificationMessage(item.message || ""))}</p>
                    ${notificationTaskMeta(item)}
                    <p class="notification-action-state ${actionStateText ? "" : "hidden"}" data-notification-state>${escapeHtml(actionStateText)}</p>
                    ${actionButtons(item)}
                </div>
            `;
        };
        const pinned = items.filter((item) => item.pinned);
        const today = items.filter((item) => !item.pinned && (item.section || "today") === "today");
        const yesterday = items.filter((item) => !item.pinned && item.section === "yesterday");
        const older = items.filter((item) => !item.pinned && !["today", "yesterday"].includes(item.section || "today"));
        return [
            groupLabel("pinned", "Pinned", !pinned.length),
            pinned.map(renderItem).join(""),
            groupLabel("today", "Today", !today.length),
            today.map(renderItem).join(""),
            groupLabel("yesterday", "Yesterday", !yesterday.length),
            yesterday.map(renderItem).join(""),
            groupLabel("older", "Older", !older.length),
            older.map(renderItem).join(""),
            `<div class="empty-state ${items.length ? "hidden" : ""}" data-notification-empty><span class="material-symbols-outlined">notifications_off</span><div><p>${escapeHtml(t("No hidden alerts"))}</p><span>${escapeHtml(t("No resolved tasks yet"))}</span></div></div>`,
        ].join("");
    };
    const checklistEntriesForNotifications = () => checklistEntriesSnapshot().sort((left, right) => Number(left.done) - Number(right.done));
    const renderChecklistNotificationMarkup = () => {
        const { entries, percent } = checklistProgressSnapshot();
        return `
            <div class="notification-todo-inline" data-notification-todo-shell style="--checklist-progress:${percent}%;">
                <div class="notification-todo-head">
                    <div class="notification-todo-progress-card">
                        <div class="notification-todo-progress-copy">
                            <span data-i18n-key="Completion">Completion</span>
                            <strong data-notification-todo-progress-label>${percent}%</strong>
                        </div>
                        <div class="checklist-progress-bar" aria-label="Checklist completion" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
                            <span></span>
                        </div>
                    </div>
                </div>
                <div class="checklist-toolbar notification-todo-toolbar">
                    <button data-notification-todo-action="complete-visible" type="button"><span class="material-symbols-outlined">done_all</span><span data-i18n-key="Complete visible">Complete visible</span></button>
                    <button data-notification-todo-action="reset" type="button"><span class="material-symbols-outlined">restart_alt</span><span data-i18n-key="Reset">Reset</span></button>
                    <button data-notification-todo-action="copy" type="button"><span class="material-symbols-outlined">content_copy</span><span data-i18n-key="Copy summary">Copy summary</span></button>
                </div>
                <button class="checklist-add-note-main notification-todo-add-note" data-notification-todo-action="toggle-note" type="button">
                    <span class="material-symbols-outlined">add_notes</span>
                    <span data-i18n-key="Add note">Add note</span>
                </button>
                <section class="checklist-note-composer hidden notification-todo-composer" data-notification-todo-composer>
                    <div class="checklist-note-template-row">
                        <label>
                            <span data-i18n-key="Template">Template</span>
                            <select data-notification-todo-template>
                                <option value="" data-i18n-key="Custom note">Custom note</option>
                                <option value="Reviewed filters and visible rows." data-template-text-key="Reviewed filters and visible rows." data-i18n-key="Filters reviewed">Filters reviewed</option>
                                <option value="Critical alerts reviewed and technician ownership checked." data-template-text-key="Critical alerts reviewed and technician ownership checked." data-i18n-key="Critical alerts reviewed">Critical alerts reviewed</option>
                                <option value="Export package checked for current visible data." data-template-text-key="Export package checked for current visible data." data-i18n-key="Export package checked">Export package checked</option>
                                <option value="Resident balances and billing history checked." data-template-text-key="Resident balances and billing history checked." data-i18n-key="Resident balances checked">Resident balances checked</option>
                            </select>
                        </label>
                    </div>
                    <textarea data-notification-todo-note-input data-i18n-placeholder="Write a checklist note..." placeholder="Write a checklist note..."></textarea>
                    <div class="checklist-note-actions">
                        <button data-notification-todo-action="cancel-note" data-i18n-key="Cancel" type="button">Cancel</button>
                        <button data-notification-todo-action="save-note" type="button"><span class="material-symbols-outlined">add</span><span data-i18n-key="Add note">Add note</span></button>
                    </div>
                </section>
                <div class="checklist-list notification-todo-list" data-notification-todo-list>${renderChecklistEntriesMarkup(entries)}</div>
                <div class="checklist-footer notification-todo-footer">
                    <button data-notification-todo-action="open-audit" type="button"><span class="material-symbols-outlined">history</span><span data-i18n-key="Open audit log">Open audit log</span></button>
                    <button data-notification-todo-action="mark-reviewed" type="button"><span class="material-symbols-outlined">task_alt</span><span data-i18n-key="Mark reviewed">Mark reviewed</span></button>
                </div>
            </div>
        `;
    };
    const renderAuditMarkup = (items = []) => {
        const iconForType = (type) => ({
            online_payment: "credit_card",
            operator_payment: "payments",
            balance: "account_balance_wallet",
            period_edit: "edit_note",
            period_status: "receipt_long",
            telegram: "send",
        }[type] || "history");
        return items.map((event) => `
            <div class="audit-event" data-audit-event data-type="${escapeAttr(event.type || "system")}" data-audit-backend-id="${escapeAttr(event.backendId || "")}" data-audit-time="${escapeAttr(event.time || "")}" data-audit-label="${escapeAttr(event.label || event.type || "")}" data-audit-title="${escapeAttr(event.title || "")}" data-audit-message="${escapeAttr(event.message || event.title || "")}" data-audit-actor="${escapeAttr(event.actor || "")}" data-audit-complex="${escapeAttr(event.complexName || "")}" data-audit-building="${escapeAttr(event.buildingName || "")}" data-audit-apartment="${escapeAttr(event.apartmentNumber || "")}" data-audit-owner="${escapeAttr(event.ownerName || "")}" data-audit-admin-url="${escapeAttr(event.adminUrl || "")}">
                <span class="audit-event-icon material-symbols-outlined">${escapeHtml(iconForType(event.type))}</span>
                <div>
                    <time>${escapeHtml(event.time || "")}</time>
                    <strong class="audit-event-actor">${escapeHtml(event.actorName || event.actor || "System")}${event.ipAddress ? ` · ${escapeHtml(event.ipAddress)}` : ""}</strong>
                    <p>${escapeHtml(event.message || event.title || "")}</p>
                    <span>${escapeHtml(event.label || event.type || "System")}</span>
                </div>
            </div>
        `).join("");
    };
    const markServerDrivenHosts = () => {
        document.querySelector("[data-resident-grid]")?.setAttribute("data-server-list", "residents");
        findSectionHeading("Recent Transaction Log")?.closest("[data-billing-transactions-card], .bg-surface-container-lowest, section")?.querySelector("table")?.setAttribute("data-server-list", "transactions");
        document.querySelector("[data-notification-list]")?.setAttribute("data-server-list", "alerts");
        document.querySelector("[data-audit-timeline]")?.setAttribute("data-server-list", "audit");
    };
    markServerDrivenHosts();
    const serverListControllers = {};
    const setupServerLists = () => {
        if (document.body.dataset.serverListsReady === "true") return;
        document.body.dataset.serverListsReady = "true";

        const residentsGrid = document.querySelector("[data-resident-grid]");
        const residentSortButtons = Array.from(document.querySelectorAll("[data-resident-sort]"));
        const residentEmpty = document.querySelector("[data-resident-filter-empty]");
        const residentCount = document.querySelector("[data-resident-filter-count]");
        const residentButtons = Array.from(document.querySelectorAll("[data-resident-filter]"));
        const residentLayout = residentsGrid?.dataset.residentLayout || "card";
        const residentExpandButton = document.querySelector("[data-resident-expand]");
        const residentFetchAll = residentsGrid?.dataset.residentFetchAll === "true";
        // Paged: one page of cards at a time with Previous / Next; search and filters still cover every resident.
        const residentPaged = residentsGrid?.dataset.residentPaged === "true";
        const residentPager = residentPaged ? document.querySelector("[data-resident-pager]") : null;
        const residentPageSize = Number(residentsGrid?.dataset.residentPageSize || residentsGrid?.dataset.residentLimit || 8) || 8;
        const residentCollapsedSize = residentFetchAll ? residentPageSize : Number(residentsGrid?.dataset.residentCollapsedSize || 10) || 10;
        let residentExpanded = residentFetchAll || residentPaged;
        let residentFilterSortState = { filter: "all", direction: "" };
        const residentFilterDefaults = {
            page: "1",
            status: "all",
            ordering: "",
            search: "",
        };
        // The list shows one page at a time, so finding a resident goes through the server, over every page.
        const residentSearch = document.querySelector("[data-resident-search]");
        const residentSearchClear = document.querySelector("[data-resident-search-clear]");
        const residentLegacyFilterKeys = ["telegram", "contract", "owner_id", "name", "phone", "telegram_user", "building", "apartment"];
        const residentSortDirections = {
            id: "desc",
            name: "asc",
            personal_account: "asc",
            phone: "asc",
            telegram_user: "asc",
            telegram_status: "desc",
            contract: "desc",
            building: "asc",
            apartment: "asc",
            balance: "desc",
        };
        const residentCountLabel = (visible, total = visible) => {
            const lang = storage.getItem("hydroflow-lang") || "en";
            const count = Number(total || visible || 0);
            if (lang === "ru") return `${count} чел.`;
            if (lang === "uz") return `${count} ab.`;
            return `${count} res.`;
        };
        const syncResidentMetaLabels = (total = residentCount?.dataset.total || 0) => {
            if (residentCount) {
                residentCount.dataset.total = String(Number(total || 0));
                residentCount.textContent = residentCountLabel(total, total);
                residentCount.title = residentCount.textContent;
            }
        };
        const residentOrderingForStatus = (status) => {
            if (status === "debtor") return "balance";
            if (status === "paid") return "-balance";
            return "name";
        };
        const ensureResidentFilterIcons = () => {
            residentButtons.forEach((button) => {
                if (button.querySelector("[data-resident-filter-sort-icon]")) return;
                const icon = document.createElement("span");
                icon.className = "material-symbols-outlined resident-filter-sort-icon";
                icon.dataset.residentFilterSortIcon = "true";
                icon.setAttribute("aria-hidden", "true");
                icon.textContent = "north";
                button.appendChild(icon);
            });
            const activeButton = residentButtons.find((button) => button.classList.contains("is-active"));
            if (activeButton && !activeButton.dataset.filterSortDirection) {
                activeButton.dataset.filterSortDirection = "none";
                const icon = activeButton.querySelector("[data-resident-filter-sort-icon]");
                if (icon) icon.textContent = "unfold_more";
            }
        };
        const syncResidentFilterSortIndicators = () => {
            residentButtons.forEach((button) => {
                const filter = button.dataset.residentFilter || "all";
                const direction = residentFilterSortState.filter === filter ? residentFilterSortState.direction : "";
                button.dataset.filterSortDirection = direction || "none";
                const icon = button.querySelector("[data-resident-filter-sort-icon]");
                if (icon) {
                    if (direction === "asc") icon.textContent = "north";
                    else if (direction === "desc") icon.textContent = "south";
                    else icon.textContent = "unfold_more";
                }
            });
        };
        const syncResidentSortButtons = (ordering) => {
            const normalized = String(ordering || "");
            const descending = normalized.startsWith("-");
            const activeKey = descending ? normalized.slice(1) : normalized;
            residentSortButtons.forEach((button) => {
                const sortKey = button.dataset.residentSort || "";
                const active = sortKey === activeKey;
                const icon = button.querySelector("[data-resident-sort-icon]");
                button.classList.toggle("is-active", active);
                button.classList.toggle("is-desc", active && descending);
                button.classList.toggle("is-asc", active && !descending);
                button.setAttribute("aria-pressed", String(active));
                if (icon) {
                    icon.textContent = active ? (descending ? "south" : "north") : "unfold_more";
                }
            });
        };
        const clearLegacyResidentFilters = () => {
            const url = new URL(window.location.href);
            let changed = false;
            residentLegacyFilterKeys.forEach((key) => {
                const param = listUrlKey("residents", key);
                if (!url.searchParams.has(param)) return;
                url.searchParams.delete(param);
                changed = true;
            });
            if (changed) {
                window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
            }
        };
        const toggleResidentOrdering = (sortKey) => {
            if (!sortKey) return;
            const current = readListUrlState("residents", residentFilterDefaults).ordering;
            const normalized = String(current || "");
            const currentKey = normalized.startsWith("-") ? normalized.slice(1) : normalized;
            const defaultDesc = residentSortDirections[sortKey] === "desc";
            const defaultValue = defaultDesc ? `-${sortKey}` : sortKey;
            const reverseValue = defaultDesc ? sortKey : `-${sortKey}`;
            let next = defaultValue;
            if (currentKey === sortKey) {
                if (normalized === defaultValue) next = reverseValue;
                else if (normalized === reverseValue) next = "";
                else next = defaultValue;
            }
            writeListUrlState("residents", { ordering: next, page: 1 });
            loadResidents();
        };
        const updateResidentExpandButton = (total, shown) => {
            if (!residentExpandButton) return;
            if (residentFetchAll || residentPaged) {
                residentExpandButton.classList.add("hidden");
                residentExpandButton.setAttribute("aria-hidden", "true");
                return;
            }
            const canExpand = !residentExpanded && Number(total || 0) > Number(shown || 0);
            residentExpandButton.classList.toggle("hidden", !canExpand);
            residentExpandButton.setAttribute("aria-hidden", canExpand ? "false" : "true");
        };
        const syncResidentPager = (payload) => {
            if (!residentPager) return;
            const pages = Math.max(1, Number(payload.pages || 1));
            const page = Math.min(pages, Math.max(1, Number(payload.page || 1)));
            // Filters can shrink the list below the page in the address: keep the page the server showed.
            if (String(readListUrlState("residents", residentFilterDefaults).page || "1") !== String(page)) {
                writeListUrlState("residents", { page });
            }
            residentPager.dataset.totalPages = String(pages);
            residentPager.classList.toggle("hidden", pages <= 1);
            const label = residentPager.querySelector("[data-page-label]");
            if (label) {
                // The language switcher rewrites the label from these numbers.
                label.dataset.pageCurrent = String(page);
                label.dataset.pageTotal = String(pages);
                label.textContent = `Page ${page} of ${pages}`;
            }
            const prev = residentPager.querySelector("[data-prev-page]");
            const next = residentPager.querySelector("[data-next-page]");
            if (prev) prev.disabled = page <= 1;
            if (next) next.disabled = page >= pages;
        };
        const goToResidentPage = async (step) => {
            const state = readListUrlState("residents", residentFilterDefaults);
            const pages = Number(residentPager?.dataset.totalPages || 1);
            const page = Math.min(pages, Math.max(1, Number(state.page || 1) + step));
            writeListUrlState("residents", { page });
            await loadResidents();
            // The new page starts at the top of the list, not where the old one was scrolled to.
            const top = residentsGrid.getBoundingClientRect().top;
            if (top < 0) residentsGrid.scrollIntoView({ block: "start", behavior: "smooth" });
        };
        const fetchResidentList = async (params, pageSize) => {
            const firstPage = await fetchServerList("/api/lists/residents/", {
                ...params,
                page: residentFetchAll ? 1 : params.page,
                page_size: pageSize,
            });
            if (!residentFetchAll) return firstPage;

            const totalPages = Number(firstPage.pages || 1);
            if (totalPages <= 1) return firstPage;

            const restPages = await Promise.all(
                Array.from({ length: totalPages - 1 }, (_item, index) => (
                    fetchServerList("/api/lists/residents/", {
                        ...params,
                        page: index + 2,
                        page_size: pageSize,
                    })
                ))
            );
            const results = [
                ...(firstPage.results || []),
                ...restPages.flatMap((page) => page.results || []),
            ];
            return {
                ...firstPage,
                page: 1,
                page_size: results.length,
                pages: 1,
                results,
            };
        };
        const loadResidents = async () => {
            if (!residentsGrid) return;
            const state = readListUrlState("residents", residentFilterDefaults);
            const { state: globalState, params } = currentGlobalListFilters();
            const scopedStatus = ["paid", "debtor"].includes(globalState.status)
                ? globalState.status
                : state.status;
            const effectivePageSize = residentExpanded
                ? residentPageSize
                : Math.min(residentCollapsedSize, residentPageSize);
            const payload = await fetchResidentList({
                ...params,
                page: state.page,
                status: scopedStatus,
                ordering: state.ordering,
                search: state.search,
            }, effectivePageSize);
            residentsGrid.innerHTML = payload.results.map((resident) => renderResidentCardMarkup(resident, residentLayout)).join("");
            if (residentSearch && document.activeElement !== residentSearch) residentSearch.value = state.search || "";
            residentSearch?.closest(".resident-search-shell")?.classList.toggle("has-value", Boolean(state.search));
            residentButtons.forEach((button) => {
                const active = (button.dataset.residentFilter || "all") === scopedStatus;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            syncResidentFilterSortIndicators();
            syncResidentSortButtons(state.ordering);
            syncResidentMetaLabels(payload.total);
            residentEmpty?.classList.toggle("hidden", payload.results.length > 0);
            updateResidentExpandButton(payload.total, payload.results.length);
            syncResidentPager(payload);
            window.HydroFlowSyncLocale?.();
        };
        if (residentsGrid) {
            clearLegacyResidentFilters();
            ensureResidentFilterIcons();
            residentButtons.forEach((button) => button.addEventListener("click", () => {
                playSound("soft-click");
                const nextStatus = button.dataset.residentFilter || "all";
                if (residentFilterSortState.filter !== nextStatus) {
                    residentFilterSortState = { filter: nextStatus, direction: "" };
                } else if (residentFilterSortState.direction === "") {
                    residentFilterSortState.direction = "asc";
                } else if (residentFilterSortState.direction === "asc") {
                    residentFilterSortState.direction = "desc";
                } else {
                    residentFilterSortState.direction = "";
                }
                let ordering = "name";
                if (residentFilterSortState.direction === "asc") ordering = "balance";
                if (residentFilterSortState.direction === "desc") ordering = "-balance";
                writeListUrlState("residents", {
                    status: nextStatus,
                    ordering,
                    page: 1,
                });
                loadResidents();
            }));
            residentSortButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    playSound("soft-click");
                    toggleResidentOrdering(button.dataset.residentSort || "");
                });
            });
            const searchResidents = (value) => {
                writeListUrlState("residents", { search: String(value || "").trim(), page: 1 });
                loadResidents();
            };
            residentSearch?.addEventListener("input", debounce(() => searchResidents(residentSearch.value), 300));
            residentSearchClear?.addEventListener("click", () => {
                if (residentSearch) residentSearch.value = "";
                searchResidents("");
                residentSearch?.focus();
            });
            residentPager?.querySelector("[data-prev-page]")?.addEventListener("click", () => {
                playSound("soft-click");
                goToResidentPage(-1);
            });
            residentPager?.querySelector("[data-next-page]")?.addEventListener("click", () => {
                playSound("soft-click");
                goToResidentPage(1);
            });
            residentExpandButton?.addEventListener("click", () => {
                playSound("soft-click");
                residentExpanded = true;
                writeListUrlState("residents", { page: 1 });
                loadResidents();
            });
            residentsGrid.addEventListener("click", (event) => {
                const actionTarget = event.target.closest("a, button, input, select, textarea, label");
                if (actionTarget) return;
                const card = event.target.closest("[data-resident-card]");
                if (!card || !residentsGrid.contains(card)) return;
                const fallback = residentFromLocalState(card.dataset.residentId, card.dataset.ownerBackendId);
                const ownerBackendId = extractOwnerBackendId(
                    card.dataset.ownerBackendId,
                    card.dataset.residentId,
                    fallback?.ownerBackendId,
                    fallback?.backendId,
                    fallback?.id
                );
                if (!ownerBackendId) return;
                openResidentProfileByOwner({ ownerBackendId, fallback, closePalette: false });
            });
            document.addEventListener("hydroflow:language-changed", () => {
                window.requestAnimationFrame(() => syncResidentMetaLabels(residentCount?.dataset.total || 0));
            });
            serverListControllers.residents = { name: "residents", load: loadResidents, refresh: () => loadResidents() };
        }

        const transactionTable = document.querySelector("table[data-server-list='transactions']")
            || findSectionHeading("Recent Transaction Log")?.closest(".bg-surface-container-lowest")?.querySelector("table");
        if (transactionTable) {
            const transactionChrome = prepareServerTableChrome(transactionTable, {
                name: "transactions",
                sortMap: ["id", "resident", "created_at", "operator", "method", "amount", "balance", "status"],
                defaultOrdering: "-created_at",
                defaultSortDirection: { id: "desc", resident: "asc", created_at: "desc", operator: "asc", method: "asc", amount: "desc", balance: "desc", status: "desc" },
                load: () => loadTransactions(),
            });
            const renderTransactions = (items = []) => {
                const colspan = transactionTable.querySelector("thead tr")?.cells.length || 7;
                if (!items.length) {
                    return `<tr data-smart-empty="true"><td class="px-6 py-8 text-sm text-on-surface-variant" colspan="${colspan}">${escapeHtml(t("No transactions found"))}</td></tr>`;
                }
                return items.map((item) => {
                    const signedAmount = Number(item.signedAmount ?? item.amount ?? 0);
                    const balanceAfter = Number(item.balanceAfter || 0);
                    const amountClass = signedAmount < 0 ? "text-error" : "text-primary";
                    const amountPrefix = signedAmount > 0 ? "+" : signedAmount < 0 ? "-" : "";
                    const balanceStatusKey = balanceAfter < 0 ? "Debt" : "No debt";
                    const balanceClass = balanceAfter < 0 ? "text-error" : "text-on-surface";
                    return `
                        <tr class="hover:bg-surface-container-low transition-colors billing-transaction-row"
                            data-transaction-id="${escapeAttr(item.id)}"
                            data-resident-id="${escapeAttr(item.residentId)}"
                            data-complex-id="${escapeAttr(item.complexId)}"
                            data-backend-id="${escapeAttr(item.backendId || "")}"
                            data-backend-type="transaction"
                            data-owner-backend-id="${escapeAttr(item.ownerBackendId || "")}"
                            data-apartment-backend-id="${escapeAttr(item.apartmentBackendId || "")}"
                            data-building-backend-id="${escapeAttr(item.buildingBackendId || "")}"
                            data-complex-backend-id="${escapeAttr(item.complexBackendId || "")}">
                            <td class="px-6 py-4">
                                <p class="font-bold text-primary text-sm">${escapeHtml(String(item.backendId || item.id || ""))}</p>
                            </td>
                            <td class="px-6 py-4">
                                <p class="font-bold text-primary text-sm">${escapeHtml(item.residentName || "Resident")}</p>
                            </td>
                            <td class="px-6 py-4 text-xs text-on-surface-variant"><span class="table-cell-label" data-i18n-key="Date time">Date time</span>${escapeHtml(item.createdAt || item.date)}</td>
                            <td class="px-6 py-4 text-xs font-medium text-on-surface-variant"><span class="table-cell-label" data-i18n-key="Operator">Operator</span>${escapeHtml(item.createdBy || t("System"))}</td>
                            <td class="px-6 py-4 text-xs font-medium text-on-surface-variant"><span class="table-cell-label" data-i18n-key="Payment method">Payment method</span>${escapeHtml(item.method || item.type || "Payment")}</td>
                            <td class="px-6 py-4 text-sm font-bold ${amountClass}"><span class="table-cell-label" data-i18n-key="Amount">Amount</span>${escapeHtml(`${amountPrefix}${formatBillingUzs(Math.abs(signedAmount))}`)}</td>
                            <td class="px-6 py-4 text-sm font-bold ${balanceClass}"><span class="table-cell-label" data-i18n-key="Balance">Balance</span>${formatBillingUzs(balanceAfter)}</td>
                            <td class="px-6 py-4"><span class="table-assigned-status ${balanceStatusKey === "Debt" ? "is-critical" : "is-success"}">${escapeHtml(t(balanceStatusKey))}</span></td>
                        </tr>
                    `;
                }).join("");
            };
            const loadTransactions = async () => {
                const state = readListUrlState("transactions", { page: "1", search: "", ordering: "" });
                const { state: globalState, params } = currentGlobalListFilters();
                const status = globalState.status === "paid" ? "success" : globalState.status === "debtor" ? "pending" : "";
                const payload = await fetchServerList("/api/lists/transactions/", {
                    ...params,
                    page: state.page,
                    page_size: 6,
                    search: state.search,
                    ordering: state.ordering,
                    status,
                });
                transactionChrome.body.innerHTML = renderTransactions(payload.results || []);
                transactionChrome.syncMeta(payload);
            };
            serverListControllers.transactions = { name: "transactions", load: loadTransactions, refresh: () => loadTransactions() };
        }

        const notificationList = document.querySelector("[data-notification-list]");
        if (notificationList) {
            const drawer = notificationList.closest("#notifications-drawer");
            drawer?.querySelector("[data-drawer-pagination='alerts']")?.remove();
            const filterButtons = Array.from(document.querySelectorAll("[data-notification-filter]"));
            const countNode = document.querySelector("[data-notification-count]");
            const resolvedCountNodes = Array.from(document.querySelectorAll("[data-notification-resolved-count]"));
            const toolbarActions = drawer?.querySelector(".notification-toolbar-actions");
            const setResolvedTabCount = (value) => {
                const numeric = Number(value) || 0;
                resolvedCountNodes.forEach((node) => {
                    node.textContent = String(numeric);
                });
            };
            const loadAlerts = async () => {
                const activeFilter = filterButtons.find((button) => button.classList.contains("is-active"))?.dataset.notificationFilter || "all";
                if (activeFilter === "todo") {
                    await refreshPortalDataSnapshot();
                    if (toolbarActions) toolbarActions.classList.add("hidden");
                    notificationList.innerHTML = renderChecklistNotificationMarkup();
                    const left = checklistEntriesForNotifications().filter((entry) => !entry.done).length;
                    if (countNode) {
                        const lang = storage.getItem("hydroflow-lang") || "en";
                        countNode.textContent = lang === "ru" ? `${left} задач осталось` : lang === "uz" ? `${left} vazifa qoldi` : `${left} tasks left`;
                    }
                    syncSidebarTodoCount();
                    window.HydroFlowSyncLocale?.();
                    return;
                }
                if (toolbarActions) toolbarActions.classList.remove("hidden");
                const { params } = currentGlobalListFilters();
                const resolvedMode = activeFilter === "resolved";
                const payload = await fetchServerList("/api/lists/alerts/", {
                    ...params,
                    page: 1,
                    page_size: 200,
                    ordering: "-pinned,-event_at",
                    status: resolvedMode ? "resolved" : "",
                    severity: resolvedMode || activeFilter === "all" ? "" : activeFilter,
                });
                if (resolvedMode) {
                    setResolvedTabCount(payload.total || 0);
                }
                notificationList.innerHTML = renderNotificationMarkup(payload.results || []);
                updateNotifications();
                window.HydroFlowSyncLocale?.();
            };
            filterButtons.forEach((button) => button.addEventListener("click", () => {
                filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
                loadAlerts();
            }));
            document.querySelectorAll("[data-notification-tab-open]").forEach((button) => {
                button.addEventListener("click", () => {
                    const tab = button.dataset.notificationTabOpen || "all";
                    filterButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.notificationFilter === tab));
                });
            });
            notificationList.addEventListener("click", (event) => {
                const todoAction = event.target.closest("[data-notification-todo-action]");
                if (todoAction) {
                    const mode = todoAction.dataset.notificationTodoAction;
                    if (mode === "complete-visible") {
                        postPortalJson("/api/checklist/item/", {
                            mode: "complete_visible",
                            item_ids: (Array.isArray(billingData.checklistItems) ? billingData.checklistItems : []).map((item) => item.backendId).filter(Boolean),
                        }).then((payload) => {
                            rehydrateFromPortalData(payload.portalData);
                            loadAlerts();
                        }).catch((error) => toast("Checklist completion failed", error.message, "danger"));
                    }
                    if (mode === "reset") {
                        postPortalJson("/api/checklist/item/", {
                            mode: "reset_all",
                        }).then((payload) => {
                            rehydrateFromPortalData(payload.portalData);
                            loadAlerts();
                        }).catch((error) => toast("Checklist reset failed", error.message, "danger"));
                    }
                    if (mode === "copy") {
                        navigator.clipboard?.writeText(buildChecklistSummaryText()).then(() => {
                            toast("Checklist copied", "Summary copied to clipboard.", "success");
                        }).catch(() => {
                            toast("Checklist summary", buildChecklistSummaryText(), "info");
                        });
                    }
                    if (mode === "toggle-note") {
                        notificationList.querySelector("[data-notification-todo-composer]")?.classList.toggle("hidden");
                        notificationList.querySelector("[data-notification-todo-note-input]")?.focus();
                    }
                    if (mode === "cancel-note") {
                        notificationList.querySelector("[data-notification-todo-composer]")?.classList.add("hidden");
                        const input = notificationList.querySelector("[data-notification-todo-note-input]");
                        const template = notificationList.querySelector("[data-notification-todo-template]");
                        if (input) input.value = "";
                        if (template) template.value = "";
                    }
                    if (mode === "save-note") {
                        const input = notificationList.querySelector("[data-notification-todo-note-input]");
                        const template = notificationList.querySelector("[data-notification-todo-template]");
                        const text = input?.value.trim() || "";
                        if (!text) {
                            toast("Checklist note required", "Choose a template or write a custom note.", "warning");
                            input?.focus();
                            return;
                        }
                        postPortalJson("/api/checklist/note/", {
                            mode: "create",
                            text,
                            template_key: template?.value || "",
                            scope: "Operations",
                        }).then((payload) => {
                            rehydrateFromPortalData(payload.portalData);
                            loadAlerts();
                            toast("Checklist note added", "Stored in backend checklist and audit trail.", "success");
                        }).catch((error) => toast("Checklist note save failed", error.message, "danger"));
                    }
                    if (mode === "open-audit") {
                        openOverlayById("audit-drawer");
                    }
                    if (mode === "mark-reviewed") {
                        postPortalJson("/api/checklist/item/", {
                            mode: "mark_reviewed",
                        }).then((payload) => {
                            rehydrateFromPortalData(payload.portalData);
                            loadAlerts();
                            toast("Checklist reviewed", "All backend checklist items were marked complete.", "success");
                        }).catch((error) => toast("Review save failed", error.message, "danger"));
                    }
                    return;
                }
                const todoNoteDelete = event.target.closest("[data-checklist-note-delete]");
                if (todoNoteDelete) {
                    const backendId = todoNoteDelete.dataset.checklistNoteBackendId || String(todoNoteDelete.dataset.checklistNoteDelete || "").replace("note-", "");
                    postPortalJson("/api/checklist/note/", {
                        mode: "delete",
                        note_id: backendId,
                    }).then((payload) => {
                        rehydrateFromPortalData(payload.portalData);
                        loadAlerts();
                        toast("Checklist note removed", "Removed from backend checklist.", "info");
                    }).catch((error) => toast("Checklist note removal failed", error.message, "danger"));
                    return;
                }
                const todoNoteToggle = event.target.closest("[data-checklist-note-toggle]");
                if (todoNoteToggle) {
                    const backendId = todoNoteToggle.dataset.checklistNoteBackendId || String(todoNoteToggle.dataset.checklistNoteToggle || "").replace("note-", "");
                    postPortalJson("/api/checklist/note/", {
                        mode: "toggle",
                        note_id: backendId,
                    }).then((payload) => {
                        rehydrateFromPortalData(payload.portalData);
                        loadAlerts();
                        playSound("toggle");
                    }).catch((error) => toast("Checklist note update failed", error.message, "danger"));
                    return;
                }
                const todoToggle = event.target.closest("[data-notification-todo-toggle]");
                const todoEntry = event.target.closest("[data-notification-todo-entry]");
                const todoItem = event.target.closest("[data-checklist-item]");
                if (!todoToggle && !todoItem) return;
                const backendId = todoItem?.dataset.checklistItemBackendId || todoEntry?.dataset.notificationTodoBackendId || "";
                if (!backendId) return;
                postPortalJson("/api/checklist/item/", { mode: "toggle", item_id: backendId }).then((response) => {
                    rehydrateFromPortalData(response.portalData);
                    loadAlerts();
                    playSound("toggle");
                }).catch((error) => toast("Checklist update failed", error.message, "danger"));
            });
            notificationList.addEventListener("change", (event) => {
                const template = event.target.closest("[data-notification-todo-template]");
                if (!template) return;
                const selected = template.selectedOptions?.[0];
                const key = selected?.dataset.templateTextKey || template.value;
                const input = notificationList.querySelector("[data-notification-todo-note-input]");
                if (input && key) input.value = translateValue(key, storage.getItem("hydroflow-lang") || "en");
            });
            serverListControllers.alerts = {
                name: "alerts",
                autoload: false,
                load: loadAlerts,
                refresh: () => loadAlerts(),
            };
        }

        const auditTimeline = document.querySelector("[data-audit-timeline]");
        if (auditTimeline) {
            const drawer = auditTimeline.closest("#audit-drawer");
            const pager = ensureDrawerPagination(auditTimeline.parentElement || drawer, "audit");
            const search = drawer?.querySelector("[data-audit-search]");
            const operatorSelect = drawer?.querySelector("[data-audit-user]");
            const filterButtons = Array.from(drawer?.querySelectorAll("[data-audit-filter]") || []);
            const loadAudit = async () => {
                const activeType = filterButtons.find((button) => button.classList.contains("is-active"))?.dataset.auditFilter || "all";
                const state = readListUrlState("audit", { page: "1", search: "", ordering: "-created_at" });
                const { params } = currentGlobalListFilters();
                const payload = await fetchServerList("/api/lists/audit/", {
                    ...params,
                    page: state.page,
                    page_size: 12,
                    search: state.search,
                    ordering: state.ordering,
                    type: activeType === "all" ? "" : activeType,
                    user_id: operatorSelect?.value || "",
                });
                auditTimeline.innerHTML = renderAuditMarkup(payload.results || []);
                if (search) search.value = state.search || "";
                if (pager) {
                    pager.dataset.totalPages = String(payload.pages || 1);
                    pager.querySelector("[data-page-label]").textContent = `Page ${payload.page} of ${payload.pages}`;
                    pager.querySelector("[data-prev-page]").disabled = Number(payload.page || 1) <= 1;
                    pager.querySelector("[data-next-page]").disabled = Number(payload.page || 1) >= Number(payload.pages || 1);
                }
                const totalLabel = drawer?.querySelector("[data-audit-total]");
                const visibleLabel = drawer?.querySelector("[data-audit-visible]");
                if (totalLabel) totalLabel.textContent = String(payload.total || 0);
                if (visibleLabel) visibleLabel.textContent = String((payload.results || []).length);
                drawer?.querySelector("[data-audit-empty]")?.classList.toggle("hidden", (payload.results || []).length > 0);
                window.HydroFlowSyncLocale?.();
            };
            search?.addEventListener("input", debounce(() => {
                writeListUrlState("audit", { search: search.value.trim(), page: 1 });
                loadAudit();
            }));
            filterButtons.forEach((button) => button.addEventListener("click", () => {
                filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
                writeListUrlState("audit", { page: 1 });
                loadAudit();
            }));
            operatorSelect?.addEventListener("change", () => {
                writeListUrlState("audit", { page: 1 });
                loadAudit();
            });
            pager?.querySelector("[data-prev-page]")?.addEventListener("click", () => {
                const state = readListUrlState("audit", { page: "1" });
                writeListUrlState("audit", { page: Math.max(1, Number(state.page || 1) - 1) });
                loadAudit();
            });
            pager?.querySelector("[data-next-page]")?.addEventListener("click", () => {
                const state = readListUrlState("audit", { page: "1" });
                writeListUrlState("audit", { page: Math.min(Number(pager?.dataset.totalPages || 1), Number(state.page || 1) + 1) });
                loadAudit();
            });
            serverListControllers.audit = {
                name: "audit",
                autoload: false,
                load: loadAudit,
                refresh: () => loadAudit(),
            };
        }

        window.HydroFlowServerLists = {
            refreshAll(options = {}) {
                const jobs = Object.values(serverListControllers).map((controller) => {
                    if (options.resetPage && controller?.name) writeListUrlState(controller.name, { page: 1 });
                    return controller?.refresh?.();
                });
                return Promise.allSettled(jobs);
            },
            ...serverListControllers,
        };

        Object.values(serverListControllers).forEach((controller) => {
            if (controller?.autoload === false) return;
            controller?.load?.();
        });
    };

    const safeSyncSiteStatistics = () => {
        syncDashboardStatCards();
        try {
            syncSiteStatistics();
        } catch (error) {
            console.warn("HydroFlow statistics sync failed", error);
        }
    };
    document.addEventListener("hydroflow:language-changed", () => {
        window.requestAnimationFrame(() => safeSyncSiteStatistics());
    });

    const setupBillingDataSync = () => {
        const syncedAttr = "billingDataSynced";
        if (document.body.dataset[syncedAttr] === "true") return;
        document.body.dataset[syncedAttr] = "true";

        const findHeading = (text, selector = "h3, h4") => Array.from(document.querySelectorAll(selector))
            .find((heading) => heading.textContent.trim().toLowerCase().includes(text.toLowerCase()));
        const riskPillClass = (risk) => risk === "Critical" ? "is-critical" : risk === "Medium Risk" ? "is-medium" : "";
        const statusPillClass = (status) => status === "Success" ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container";
        const residentAvatar = (resident) => resident.photo
            ? `<img class="h-12 w-12 rounded-lg object-cover" src="${escapeHtml(resident.photo)}" alt="">`
            : `<div class="h-12 w-12 rounded-lg ${resident.status === "debtor" ? "bg-error/20 text-error" : "bg-secondary/20 text-secondary"} flex items-center justify-center font-bold text-xl">${escapeHtml(initialsFor(resident.name))}</div>`;
        const renderResidentCard = (resident) => {
            const isDebtor = resident.status === "debtor";
            const balanceClass = isDebtor ? "text-error" : resident.balance > 0 ? "text-secondary" : "text-on-surface";
            const button = isDebtor
                ? `<button class="w-full py-2 bg-error text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors" type="button" data-i18n-key="SEND URGENT REMINDER" data-reminder-action>SEND URGENT REMINDER</button>`
                : `<button class="w-full py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors" data-resident-billing-history type="button" data-i18n-key="VIEW BILLING HISTORY">VIEW BILLING HISTORY</button>`;
            return `
                <div class="resident-card group ${isDebtor ? "bg-error-container/30 border-error/20" : "bg-secondary-container/20 border-secondary/10"} border p-5 rounded-xl transition-all hover:shadow-lg relative overflow-hidden"
                    data-resident-card data-resident-id="${escapeHtml(resident.id)}" data-complex-id="${escapeHtml(resident.complexId)}" data-resident-status="${escapeHtml(resident.status)}"
                    data-owner-backend-id="${escapeHtml(resident.ownerBackendId || resident.backendId || "")}"
                    data-apartment-backend-id="${escapeHtml(resident.apartmentBackendId || "")}"
                    data-building-backend-id="${escapeHtml(resident.buildingBackendId || "")}"
                    data-complex-backend-id="${escapeHtml(resident.complexBackendId || "")}">
                    <div class="absolute top-0 right-0 w-16 h-16 ${isDebtor ? "bg-error/10" : "bg-secondary/10"} rounded-bl-full flex items-start justify-end p-2 transition-transform group-hover:scale-110">
                        <span class="material-symbols-outlined ${isDebtor ? "text-error" : "text-secondary"} text-[20px]">${isDebtor ? "warning" : "check_circle"}</span>
                    </div>
                    <div class="flex items-start gap-4 mb-4">
                        ${residentAvatar(resident)}
                        <div>
                            <h4 class="font-bold text-on-surface leading-tight">${escapeHtml(resident.name)}</h4>
                            <p class="text-xs text-on-surface-variant">${escapeHtml(resident.apartment)}</p>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between items-end">
                            <span class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" data-i18n-key="Current Balance">Current Balance</span>
                            <span class="text-xl font-black ${balanceClass}">${formatBillingUzs(resident.balance)}</span>
                        </div>
                        <div class="bg-white/40 p-3 rounded-lg text-[11px] space-y-1.5">
                            <p class="text-on-surface-variant flex justify-between"><span data-i18n-key="Phone:">Phone:</span> <span class="text-on-surface font-semibold">${escapeHtml(resident.phone)}</span></p>
                            <p class="text-on-surface-variant flex justify-between"><span data-i18n-key="Last Payment:">Last Payment:</span> <span class="text-on-surface font-semibold">${escapeHtml(resident.lastPayment)}</span></p>
                        </div>
                        ${button}
                    </div>
                </div>
            `;
        };

        const residentGrid = document.querySelector("[data-resident-grid]");
        if (residentGrid && residentGrid.dataset.serverList !== "residents") {
            residentGrid.innerHTML = billingData.residents.map(renderResidentCard).join("");
        }

        const repairEnhancedTableControls = (table) => {
            if (!table) return;
            if (table.dataset.serverList) return;
            if (table.dataset.billingControlsReady === "true") {
                table.HydroFlowRefreshTableControls?.();
                return;
            }
            const body = table.querySelector("tbody");
            const workspace = table.closest(".table-workspace") || table.closest(".overflow-x-auto") || table;
            let tools = workspace.previousElementSibling?.classList?.contains("table-tools") ? workspace.previousElementSibling : null;
            let pagination = workspace.nextElementSibling?.classList?.contains("table-pagination") ? workspace.nextElementSibling : null;
            if (!body || !tools) return;
            const cleanTools = tools.cloneNode(true);
            tools.replaceWith(cleanTools);
            tools = cleanTools;
            if (pagination) {
                const cleanPagination = pagination.cloneNode(true);
                pagination.replaceWith(cleanPagination);
                pagination = cleanPagination;
            }
            const search = tools.querySelector(".table-search");
            const tableHead = table.querySelector("thead");
            if (tableHead) {
                const cleanHead = tableHead.cloneNode(true);
                tableHead.replaceWith(cleanHead);
            }
            const selectAll = table.querySelector("[data-select-all]");
            const isResidentialHouseTable = table.classList.contains("residential-performance-table");
            table.dataset.billingControlsReady = "true";
            let page = 1;
            // The houses table shows every house on one page: the sector has only a handful.
            const pageSize = isResidentialHouseTable ? 50 : 6;
            let filteredRows = [];
            const currentRows = () => Array.from(body.querySelectorAll("tr")).filter((row) => {
                if (row.dataset.smartEmpty) return false;
                if (!isResidentialHouseTable) return true;
                return row.dataset.drillRow !== "district" && row.dataset.drillRow !== "apartment";
            });
            const ensureCheckboxes = () => {
                if (!selectAll) return;
                currentRows().forEach((row) => {
                    if (row.querySelector("[data-row-select]")) return;
                    row.insertAdjacentHTML("afterbegin", '<td class="px-4 py-4"><input aria-label="Select row" data-row-select type="checkbox"></td>');
                });
            };
            const updateSelection = () => {
                const selected = currentRows().filter((row) => row.querySelector("[data-row-select]")?.checked).length;
                const selectedLabel = tools.querySelector("[data-selected-count]");
                if (!selectedLabel) return;
                selectedLabel.dataset.count = selected;
                selectedLabel.textContent = `${selected} selected`;
                window.HydroFlowSyncLocale?.();
            };
            const updateVisibleRows = () => {
                const rows = currentRows();
                const query = search?.value.trim().toLowerCase() || "";
                filteredRows = rows.filter((row) => row.dataset.globalFilterHidden !== "true" && (!query || row.textContent.toLowerCase().includes(query)));
                const maxPage = Math.max(1, Math.ceil(filteredRows.length / pageSize));
                page = Math.min(page, maxPage);
                rows.forEach((row) => row.classList.add("hidden"));
                filteredRows.slice((page - 1) * pageSize, page * pageSize).forEach((row) => row.classList.remove("hidden"));
                const pageLabel = pagination?.querySelector("[data-page-label]");
                if (pageLabel) {
                    pageLabel.dataset.pageCurrent = page;
                    pageLabel.dataset.pageTotal = maxPage;
                    pageLabel.textContent = `Page ${page} of ${maxPage}`;
                }
                // One page of houses needs no page switcher.
                if (isResidentialHouseTable) pagination?.classList.toggle("hidden", maxPage <= 1);
                updateSelection();
            };
            ensureCheckboxes();
            search?.addEventListener("input", () => {
                page = 1;
                updateVisibleRows();
            });
            tools.querySelector("[data-table-action='reminders']")?.addEventListener("click", () => {
                document.querySelector("[data-modal-open='notifications-drawer'], [data-drawer-open='notifications-drawer']")?.click();
            });
            selectAll?.addEventListener("change", (event) => {
                currentRows().forEach((row) => {
                    if (row.classList.contains("hidden")) return;
                    const checkbox = row.querySelector("[data-row-select]");
                    if (checkbox) checkbox.checked = event.target.checked;
                });
                updateSelection();
            });
            body.addEventListener("change", (event) => {
                if (event.target.matches("[data-row-select]")) updateSelection();
            });
            const semanticSortValue = (row, index, label) => {
                const labelKey = String(label || "").toLowerCase();
                const text = String(row.cells[index]?.textContent || "").trim();
                const key = text.toLowerCase();
                const datasetNumber = (name) => {
                    const value = Number(row.dataset[name]);
                    return Number.isFinite(value) ? { type: "number", value } : null;
                };
                const datasetText = (name) => row.dataset[name]
                    ? { type: "text", value: String(row.dataset[name]).toLowerCase() }
                    : null;
                if (row.classList.contains("residential-district-row") || row.classList.contains("residential-building-row")) {
                    if (labelKey.includes("complex") || labelKey.includes("house") || labelKey.includes("dom") || labelKey.includes("uy") || labelKey.includes("kompleks")) {
                        const value = datasetText("sortName");
                        if (value) return value;
                    }
                    if (labelKey.includes("infra") || labelKey.includes("apart") || labelKey.includes("unit") || labelKey.includes("kv")) {
                        const value = datasetNumber("sortUnits") || datasetNumber("sortBuildings");
                        if (value) return value;
                    }
                    if (
                        labelKey.includes("system")
                        || labelKey.includes("area")
                        || labelKey.includes("maydon")
                    ) {
                        const value = datasetNumber("sortArea") || datasetNumber("sortSystemRank") || datasetNumber("sortHealth");
                        if (value) return value;
                    }
                    if (labelKey.includes("resident") || labelKey.includes("tenant") || labelKey.includes("abonent")) {
                        const value = datasetNumber("sortResidents") || datasetNumber("sortHealth") || datasetNumber("sortFinance");
                        if (value) return value;
                    }
                    if (labelKey.includes("finance") || labelKey.includes("moliya")) {
                        const value = datasetNumber("sortHealth") || datasetNumber("sortFinance");
                        if (value) return value;
                    }
                    if (labelKey.includes("debt") || labelKey.includes("qarz")) {
                        const value = datasetNumber("sortDebt");
                        if (value) return value;
                    }
                }
                if (labelKey.includes("priority") || labelKey.includes("приоритет") || labelKey.includes("ustuvor")) {
                    const priority = row.dataset.priority || key;
                    if (priority.includes("high") || priority.includes("высок") || priority.includes("yuqori")) return { type: "rank", value: 3 };
                    if (priority.includes("medium") || priority.includes("сред") || priority.includes("o'rta")) return { type: "rank", value: 2 };
                    if (priority.includes("low") || priority.includes("низ") || priority.includes("past")) return { type: "rank", value: 1 };
                }
                if (labelKey.includes("status") || labelKey.includes("статус") || labelKey.includes("holat")) {
                    const status = row.dataset.statusKey || key;
                    if (status.includes("critical") || status.includes("overdue") || status.includes("критич")) return { type: "rank", value: 5 };
                    if (status.includes("progress") || status.includes("active") || status.includes("актив")) return { type: "rank", value: 4 };
                    if (status.includes("pending") || status.includes("planned") || status.includes("warning") || status.includes("ожид")) return { type: "rank", value: 3 };
                    if (status.includes("scheduled") || status.includes("upcoming") || status.includes("заплан")) return { type: "rank", value: 2 };
                    if (status.includes("completed") || status.includes("success") || status.includes("paid") || status.includes("заверш")) return { type: "rank", value: 1 };
                }
                if (labelKey.includes("date") || labelKey.includes("time") || labelKey.includes("дата") || labelKey.includes("время")) {
                    return { type: "date", value: dateValue(text) };
                }
                const numeric = Number(text.replace(/[^\d.-]/g, ""));
                if (Number.isFinite(numeric) && /\d/.test(text) && !/[a-zа-я]/i.test(text.replace(/uzs/ig, ""))) {
                    return { type: "number", value: numeric };
                }
                return { type: "text", value: key };
            };
            const compareSemanticRows = (a, b, index, direction, label) => {
                const av = semanticSortValue(a, index, label);
                const bv = semanticSortValue(b, index, label);
                const result = av.type === "text" || bv.type === "text"
                    ? String(av.value).localeCompare(String(bv.value), undefined, { numeric: true, sensitivity: "base" })
                    : av.value - bv.value;
                return direction === "asc" ? result : -result;
            };
            const setupCleanSort = () => {
                const headRow = table.querySelector("thead tr");
                if (!headRow) return;
                Array.from(headRow.cells).forEach((header, index) => {
                    if (header.querySelector("[data-select-all]")) return;
                    if (header.classList.contains("no-table-filter")) {
                        header.classList.remove("table-filter-heading");
                        header.removeAttribute("role");
                        header.removeAttribute("tabindex");
                        header.removeAttribute("aria-label");
                        const icon = header.querySelector(".table-sort-heading-icon");
                        if (icon) icon.remove();
                        return;
                    }
                    const label = header.querySelector(".table-filter-heading-text")?.textContent.trim() || header.textContent.trim();
                    if (!label) {
                        header.classList.remove("table-filter-heading");
                        header.removeAttribute("role");
                        header.removeAttribute("tabindex");
                        header.removeAttribute("aria-label");
                        const icon = header.querySelector(".table-sort-heading-icon");
                        if (icon) icon.remove();
                        return;
                    }
                    header.classList.add("table-filter-heading");
                    header.setAttribute("role", "button");
                    header.setAttribute("tabindex", "0");
                    header.setAttribute("aria-label", `Sort by ${label}`);
                    const sortIcon = header.querySelector(".table-sort-heading-icon");
                    const applySort = () => {
                        const direction = header.dataset.sortDirection === "asc" ? "desc" : "asc";
                        Array.from(headRow.cells).forEach((cell) => {
                            if (cell !== header) {
                                delete cell.dataset.sortDirection;
                                const icon = cell.querySelector(".table-sort-heading-icon");
                                if (icon) icon.textContent = "unfold_more";
                            }
                        });
                        header.dataset.sortDirection = direction;
                        if (sortIcon) sortIcon.textContent = direction === "asc" ? "arrow_upward" : "arrow_downward";
                        if (isResidentialHouseTable) {
                            body.querySelectorAll(".residential-drill-row[data-drill-row='apartment']").forEach((row) => row.remove());
                            body.querySelectorAll("[data-drill-row='building']").forEach((row) => {
                                row.classList.remove("is-expanded");
                                row.setAttribute("aria-expanded", "false");
                            });
                        } else {
                            body.querySelectorAll(".residential-drill-row:not([data-drill-row='district'])").forEach((row) => row.remove());
                            body.querySelectorAll("[data-drill-row='district']").forEach((row) => {
                                row.classList.remove("is-expanded");
                                row.setAttribute("aria-expanded", "false");
                            });
                        }
                        const rows = currentRows();
                        rows.sort((a, b) => compareSemanticRows(a, b, index, direction, label));
                        rows.forEach((row) => body.appendChild(row));
                        page = 1;
                        updateVisibleRows();
                    };
                    header.addEventListener("click", applySort);
                    header.addEventListener("keydown", (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            applySort();
                        }
                    });
                });
            };
            setupCleanSort();
            pagination?.querySelector("[data-prev-page]")?.addEventListener("click", () => {
                page = Math.max(1, page - 1);
                updateVisibleRows();
            });
            pagination?.querySelector("[data-next-page]")?.addEventListener("click", () => {
                page += 1;
                updateVisibleRows();
            });
            table.HydroFlowRefreshTableControls = () => {
                ensureCheckboxes();
                updateVisibleRows();
            };
            updateVisibleRows();
        };

        const recentHeading = findHeading("Recent Transaction Log");
        const recentTable = recentHeading?.closest("[data-billing-transactions-card], .bg-surface-container-lowest, section")?.querySelector("table");
        const recentTableBody = recentTable?.querySelector("tbody");
        if (recentTableBody && recentTable?.dataset.serverList !== "transactions") {
            const headers = Array.from(recentTable.querySelectorAll("thead th"))
                .filter((cell) => !cell.querySelector("[data-select-all]"))
                .map((cell) => cell.textContent.trim().toLowerCase());
            const hasSelect = Boolean(recentTable.querySelector("[data-select-all]"));
            const usesAnalyticsColumns = headers.some((label) => label.includes("transaction id") || label.includes("provider") || label.includes("payer"));
            const selectCell = (label) => hasSelect ? `<td class="px-4 py-4"><input aria-label="${escapeHtml(label)}" data-row-select type="checkbox"></td>` : "";
            const statusBadge = (status) => `<span class="table-assigned-status ${status === "Success" ? "is-success" : "is-warning"}" data-i18n-key="${escapeHtml(status)}">${escapeHtml(status)}</span>`;
            const rows = billingData.transactions.slice()
                .sort((a, b) => dateValue(b.date) - dateValue(a.date))
                .map((transaction) => {
                    const resident = getResidentById(transaction.residentId);
                    const isPending = transaction.status !== "Success";
                    if (usesAnalyticsColumns) {
                        return `
                            <tr class="border-b border-surface-container-low hover:bg-surface-container-low/50 transition-colors" data-transaction-id="${escapeHtml(transaction.id)}" data-resident-id="${escapeHtml(transaction.residentId)}" data-complex-id="${escapeHtml(transaction.complexId)}" data-backend-id="${escapeHtml(transaction.backendId || "")}" data-backend-type="transaction">
                                ${selectCell(`Select ${transaction.id}`)}
                                <td class="px-6 py-4">
                                    <p class="font-mono text-xs text-primary font-bold">${escapeHtml(transaction.id.toUpperCase())}</p>
                                    <p class="text-[10px] text-on-surface-variant">${escapeHtml(transaction.type)}</p>
                                </td>
                                <td class="px-6 py-4">
                                    <p class="font-semibold text-on-surface">${escapeHtml(resident?.name || "Resident")}</p>
                                    <p class="text-[10px] text-on-surface-variant">${escapeHtml(resident?.apartment || "")}</p>
                                </td>
                                <td class="px-6 py-4 text-xs font-medium text-on-surface-variant">${escapeHtml(transaction.method)}</td>
                                <td class="px-6 py-4 font-bold ${isPending ? "text-error" : "text-on-surface"}">${formatBillingUzs(transaction.amount)}</td>
                                <td class="px-6 py-4">${statusBadge(transaction.status)}</td>
                                <td class="px-6 py-4 text-right text-on-surface-variant">${escapeHtml(transaction.date)}</td>
                            </tr>
                        `;
                    }
                    return `
                        <tr class="hover:bg-surface-container-low transition-colors" data-transaction-id="${escapeHtml(transaction.id)}" data-resident-id="${escapeHtml(transaction.residentId)}" data-complex-id="${escapeHtml(transaction.complexId)}" data-backend-id="${escapeHtml(transaction.backendId || "")}" data-backend-type="transaction">
                            ${selectCell(`Select ${transaction.id}`)}
                            <td class="px-6 py-4">
                                <p class="font-bold text-primary text-sm">${escapeHtml(resident?.name || "Resident")}</p>
                                <p class="text-[10px] text-on-surface-variant">${escapeHtml(transaction.id.toUpperCase())}</p>
                            </td>
                            <td class="px-6 py-4 text-xs font-medium text-on-surface-variant" data-i18n-key="${escapeHtml(transaction.type)}">${escapeHtml(transaction.type)}</td>
                            <td class="px-6 py-4 text-xs text-on-surface-variant">${escapeHtml(transaction.date)}</td>
                            <td class="px-6 py-4 text-sm font-bold ${isPending ? "text-error" : "text-on-surface"}">${formatBillingUzs(transaction.amount)}</td>
                            <td class="px-6 py-4">${statusBadge(transaction.status)}</td>
                        </tr>
                    `;
                }).join("");
            recentTableBody.innerHTML = rows;
            repairEnhancedTableControls(recentTable);
        }

        const revenueCard = document.querySelector(".revenue-debt-card");
        if (revenueCard) {
            const sector = getSingleSectorStats();
            const sectorName = revenueCard.querySelector("[data-sector-revenue-name]");
            const sectorMeter = revenueCard.querySelector("[data-sector-revenue-meter]");
            const sectorDebtors = revenueCard.querySelector("[data-sector-revenue-debtors]");
            const sectorPaid = revenueCard.querySelector("[data-sector-revenue-paid]");
            const sectorCollected = revenueCard.querySelector("[data-sector-revenue-collected]");
            const sectorDebt = revenueCard.querySelector("[data-sector-revenue-debt]");
            const sectorPill = revenueCard.querySelector("[data-sector-revenue-pill]");
            const topCaption = revenueCard.querySelector("[data-sector-top-caption]");
            const topHousesHost = revenueCard.querySelector("[data-sector-top-houses]");
            const debtSplitRatio = sector.paidResidents === 0 ? Infinity : sector.debtorResidents / Math.max(sector.paidResidents, 1);
            const debtSplitTone = debtSplitRatio > 1 ? "is-danger" : debtSplitRatio >= 0.75 ? "is-caution" : "is-healthy";
            const buildingRows = (Array.isArray(sector.buildingItems) ? sector.buildingItems : []).map((building, index) => {
                const apartments = Array.isArray(building.apartments) ? building.apartments : [];
                const fallbackDebt = apartments.reduce((total, apartment) => {
                    const balance = Number(apartment.balance || 0);
                    return total + (balance < 0 ? Math.abs(balance) : 0);
                }, 0);
                const fallbackDebtors = apartments.filter((apartment) => Number(apartment.balance || 0) < 0).length;
                const debt = Number.isFinite(Number(building.debt)) ? Number(building.debt) : fallbackDebt;
                const debtorResidents = Number.isFinite(Number(building.debtorResidents)) ? Number(building.debtorResidents) : fallbackDebtors;
                const health = Number.isFinite(Number(building.health)) ? Number(building.health) : Number(sector.health || 0);
                const risk = building.risk || riskForHealth(health);
                return {
                    id: building.backendId || building.id || `sector-house-${index + 1}`,
                    name: building.name || `House ${building.number || index + 1}`,
                    debt,
                    debtorResidents,
                    health,
                    tone: building.tone || toneForRisk(risk),
                };
            });
            const totalDebt = buildingRows.reduce((sum, row) => sum + Math.max(0, Number(row.debt) || 0), 0);
            const topHouses = buildingRows
                .filter((row) => Math.max(0, Number(row.debt) || 0) > 0)
                .sort((a, b) => b.debt - a.debt)
                .slice(0, 5);

            if (sectorName) sectorName.textContent = sector.name || "Mirabad Avenue";
            if (sectorDebtors) sectorDebtors.textContent = moneyFormatter.format(Number(sector.debtorResidents) || 0);
            if (sectorPaid) sectorPaid.textContent = moneyFormatter.format(Number(sector.paidResidents) || 0);
            if (sectorCollected) sectorCollected.textContent = formatBillingUzs(Number(sector.collected) || 0);
            if (sectorDebt) sectorDebt.textContent = formatBillingUzs(Number(sector.debt) || 0);
            if (sectorPill) sectorPill.className = `resident-debt-split ${debtSplitTone}`;
            if (sectorMeter) {
                const progress = Math.max(0, Math.min(100, Number(sector.health) || 0));
                const remainder = Math.max(0, 100 - progress);
                sectorMeter.className = `percent-meter percent-meter-${escapeHtml(sector.tone || "blue")}`;
                sectorMeter.style.setProperty("--progress", `${progress}%`);
                sectorMeter.style.setProperty("--remainder", `${remainder}%`);
                sectorMeter.dataset.value = percentValue(progress);
                sectorMeter.setAttribute("aria-label", `${sector.name || "Sector"} health ${percentValue(progress)}`);
            }
            if (topCaption) {
                topCaption.textContent = `${moneyFormatter.format(topHouses.length)} ${t("houses in debt view")}`;
            }
            if (topHousesHost) {
                topHousesHost.innerHTML = topHouses.map((house) => {
                    const share = totalDebt > 0 ? (house.debt / totalDebt) * 100 : 0;
                    return `
                        <div class="debtor-row flex items-center justify-between gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/5" data-sector-top-house-row="${escapeHtml(house.id)}">
                            <div class="min-w-0">
                                <span class="block text-xs font-semibold truncate">${escapeHtml(house.name)}</span>
                                <span class="block text-[10px] font-bold text-on-surface-variant">${formatBillingUzs(house.debt)} · ${moneyFormatter.format(house.debtorResidents)} ${escapeHtml(t("debt residents"))}</span>
                            </div>
                            <div class="percent-meter percent-meter-${escapeHtml(house.tone)} percent-meter-row shrink-0" style="--progress: ${Math.min(100, share)}%;" data-value="${percentValue(share)}" aria-label="${escapeHtml(house.name)} debt share ${percentValue(share)}">
                                <span class="percent-meter-track"><span class="percent-meter-fill"></span></span>
                            </div>
                        </div>
                    `;
                }).join("");
            }
        }

        const performanceCard = document.querySelector("[data-residential-performance-card]")
            || findHeading("Complex Performance Overview")?.closest(".bg-surface-container-lowest");
        const performanceTable = performanceCard?.querySelector("[data-residential-performance-table]")
            || performanceCard?.querySelector("table");
        const performanceBody = performanceTable?.querySelector("tbody");
        if (performanceBody) {
            const hasSelect = Boolean(performanceTable.querySelector("[data-select-all]"));
            const selectCell = (label) => hasSelect ? `<td class="px-4 py-5"><input aria-label="${escapeHtml(label)}" data-row-select type="checkbox"></td>` : "";
            const iconMarkup = (complex) => complex.image
                ? `<div class="w-10 h-10 rounded-lg overflow-hidden shrink-0"><img class="w-full h-full object-cover" src="${escapeHtml(complex.image)}" alt=""></div>`
                : `<div class="w-10 h-10 rounded-lg overflow-hidden shrink-0 text-primary-container bg-surface-container-high flex items-center justify-center"><span class="material-symbols-outlined" style="font-size: 20px;">${escapeHtml(complex.icon || "domain")}</span></div>`;
            const systemStatePillClass = (value) => {
                const normalized = String(value || "").toLowerCase();
                if (normalized.includes("leak")) return "is-critical";
                if (normalized.includes("maintenance")) return "is-medium";
                if (normalized.includes("review")) return "is-review";
                return "";
            };
            const renderSystemState = (labelKey, value) => `
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tight">
                        <span data-i18n-key="${escapeHtml(labelKey)}">${escapeHtml(labelKey)}</span>:
                    </span>
                    <span class="residential-risk-pill ${systemStatePillClass(value)}" data-i18n-key="${escapeHtml(value)}">${escapeHtml(value)}</span>
                </div>
            `;
            const debtSplitTone = (debtors, paid) => {
                const ratio = paid ? debtors / paid : Infinity;
                if (ratio > 1) return "is-danger";
                if (ratio >= 0.75) return "is-caution";
                return "is-healthy";
            };
            const singleSector = getSingleSectorStats();
            performanceBody.innerHTML = [singleSector].map((complex) => {
                const residentCount = Number(complex.debtorResidents || 0) + Number(complex.paidResidents || 0);
                const riskTextClass = complex.risk === "Critical" ? "text-error" : "text-on-surface";
                const splitTone = debtSplitTone(complex.debtorResidents, complex.paidResidents);
                return `
                    <tr aria-expanded="false" class="hover:bg-surface-container-low/30 transition-colors residential-district-row residential-sector-root-row"
                        data-district-id="${escapeHtml(complex.id)}"
                        data-backend-id="${escapeHtml(complex.backendId || "")}"
                        data-backend-type="sector"
                        data-drill-row="district"
                        data-sort-name="${escapeHtml(complex.name)}"
                        data-sort-buildings="${Number(complex.buildings) || 0}"
                        data-sort-units="${Number(complex.units) || 0}"
                        data-sort-health="${residentCount}"
                        data-sort-residents="${residentCount}"
                        data-sort-area="${Number(complex.totalArea) || 0}"
                        data-sort-finance="${Number(complex.finances) || 0}"
                        data-sort-debt="${Number(complex.debt) || 0}"
                        data-sort-debtors="${Number(complex.debtorResidents) || 0}"
                        data-sort-paid="${Number(complex.paidResidents) || 0}"
                        tabindex="0">
                        ${selectCell(`Select ${complex.name}`)}
                        <td class="px-6 py-5">
                            <div class="flex items-center gap-4">
                                <span class="material-symbols-outlined residential-drill-chevron" aria-hidden="true">expand_more</span>
                                ${iconMarkup(complex)}
                                <div>
                                    <p class="font-bold text-primary leading-tight">${escapeHtml(complex.name)}</p>
                                    <p class="text-xs text-on-surface-variant">${escapeHtml(complex.sector)}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-5">
                            <p class="text-sm font-bold text-on-surface">
                                ${moneyFormatter.format(complex.units)}
                                <span class="text-xs font-normal text-on-surface-variant" data-i18n-key="Apartments">Apartments</span>
                            </p>
                        </td>
                        <td class="px-6 py-5">
                            <div class="space-y-1">
                                <p class="text-sm font-bold text-on-surface">${formatAreaM2(complex.totalArea)}</p>
                                <p class="text-xs text-on-surface-variant" data-i18n-key="Area (m²)">Area (m²)</p>
                            </div>
                        </td>
                        <td class="px-6 py-5">
                            <p class="text-sm font-bold ${riskTextClass}">${formatBillingUzs(complex.debt)}</p>
                            <span class="residential-risk-pill ${riskPillClass(complex.risk)}" data-i18n-key="${escapeHtml(complex.risk)}">${escapeHtml(complex.risk)}</span>
                        </td>
                        <td class="px-6 py-5 text-right">
                            <div class="residential-action-cell">
                                <div class="resident-debt-split ${splitTone}" aria-label="${complex.debtorResidents} debtors and ${complex.paidResidents} paid residents">
                                    <span><b>${complex.debtorResidents}</b><small data-i18n-key="Debt">Debt</small></span>
                                    <span><b>${complex.paidResidents}</b><small data-i18n-key="Paid">Paid</small></span>
                                </div>
                                <button class="p-2 text-primary hover:bg-primary-container/10 rounded-lg transition-colors" type="button" title="Manage Units">
                                    <span class="material-symbols-outlined">settings_suggest</span>
                                </button>
                                <button class="residential-detail-button" data-detail-open type="button" data-i18n-key="Details">Details</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
            repairEnhancedTableControls(performanceTable);
        }

        safeSyncSiteStatistics();
        window.HydroFlowSyncLocale?.();
    };

    const setupGlobalFilters = () => {
        document.body.dataset.globalFiltersReady = "true";
        window.HydroFlowApplyFilters = () => {};
    };

    document.querySelectorAll("[data-notification-filter]").forEach((button) => button.addEventListener("click", () => {
        document.querySelectorAll("[data-notification-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
        updateNotifications();
    }));

    const setupResidentFilters = () => {
        const group = document.querySelector("[data-resident-filter-group]");
        const grid = document.querySelector("[data-resident-grid]");
        if (!group || !grid || group.dataset.ready === "true") return;
        if (grid.dataset.serverList === "residents") {
            group.dataset.ready = "true";
            return;
        }
        group.dataset.ready = "true";

        const buttons = Array.from(group.querySelectorAll("[data-resident-filter]"));
        const cards = Array.from(grid.querySelectorAll("[data-resident-card]"));
        const search = document.querySelector("[data-resident-search]");
        const clearSearch = document.querySelector("[data-resident-search-clear]");
        const count = group.querySelector("[data-resident-filter-count]");
        const empty = document.querySelector("[data-resident-filter-empty]");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const requestedFilter = storage.getItem("hydroflow-requested-billing-filter");
        let activeFilter = buttons.find((button) => button.classList.contains("is-active"))?.dataset.residentFilter || "all";
        if (requestedFilter && buttons.some((button) => button.dataset.residentFilter === requestedFilter)) {
            activeFilter = requestedFilter;
            storage.removeItem("hydroflow-requested-billing-filter");
        }

        const countLabel = (visible) => {
            const lang = storage.getItem("hydroflow-lang") || "en";
            if (lang === "ru") return `${visible} показано`;
            if (lang === "uz") return `${visible} ko'rsatildi`;
            return `${visible} shown`;
        };

        const applyResidentFilter = (filter = activeFilter) => {
            activeFilter = filter;
            const query = search?.value.trim().toLowerCase() || "";
            buttons.forEach((button) => {
                const active = button.dataset.residentFilter === filter;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", String(active));
            });

            let visible = 0;
            let matched = 0;
            cards.forEach((card, index) => {
                const globalMatch = card.dataset.globalFilterHidden !== "true";
                const statusMatch = filter === "all" || card.dataset.residentStatus === filter;
                const queryMatch = !query || card.textContent.toLowerCase().includes(query);
                const matchedCard = globalMatch && statusMatch && queryMatch;
                if (matchedCard) matched += 1;
                const show = matchedCard && matched <= 8;
                window.clearTimeout(card._residentFilterTimer);
                if (show) {
                    visible += 1;
                    card.hidden = false;
                    card.style.animationDelay = reducedMotion ? "0ms" : `${Math.min(index * 42, 150)}ms`;
                    card.classList.remove("is-filtering-out");
                    card.classList.add("is-filtering-in");
                    card._residentFilterTimer = window.setTimeout(() => {
                        card.classList.remove("is-filtering-in");
                        card.style.animationDelay = "";
                    }, reducedMotion ? 0 : 340);
                } else {
                    card.classList.remove("is-filtering-in");
                    card.classList.add("is-filtering-out");
                    card._residentFilterTimer = window.setTimeout(() => {
                        card.hidden = true;
                    }, reducedMotion ? 0 : 190);
                }
            });

            if (count) count.textContent = countLabel(visible);
            empty?.classList.toggle("hidden", visible > 0);
            search?.closest(".resident-search-shell")?.classList.toggle("has-value", Boolean(query));
        };

        buttons.forEach((button) => {
            button.addEventListener("click", () => applyResidentFilter(button.dataset.residentFilter));
        });
        search?.addEventListener("input", () => applyResidentFilter(activeFilter));
        search?.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && search.value) {
                search.value = "";
                applyResidentFilter(activeFilter);
            }
        });
        clearSearch?.addEventListener("click", () => {
            if (!search) return;
            search.value = "";
            search.focus();
            applyResidentFilter(activeFilter);
        });
        document.querySelectorAll("[data-lang-toggle]").forEach((button) => {
            button.addEventListener("click", () => window.setTimeout(() => applyResidentFilter(activeFilter), 0));
        });
        applyResidentFilter(activeFilter);
    };

    const setupResidentViewer = () => {
        const modal = document.getElementById("all-residents-modal");
        const list = modal?.querySelector("[data-all-residents-list]");
        const count = modal?.querySelector("[data-all-residents-count]");
        const empty = modal?.querySelector("[data-all-residents-empty]");
        const search = modal?.querySelector("[data-all-residents-search]");
        const clearSearch = modal?.querySelector("[data-all-residents-search-clear]");
        const filterButtons = Array.from(modal?.querySelectorAll("[data-all-residents-filter]") || []);
        const openButton = document.querySelector("[data-modal-open='all-residents-modal']");
        if (!modal || !list || !count || !openButton || modal.dataset.ready === "true") return;
        modal.dataset.ready = "true";
        let activeFilter = "all";

        const countLabel = (visible) => {
            const lang = storage.getItem("hydroflow-lang") || "en";
            if (lang === "ru") return `${visible} показано`;
            if (lang === "uz") return `${visible} ko'rsatildi`;
            return `${visible} shown`;
        };

        const readResidentCard = (sourceCard) => {
            const name = sourceCard.dataset.residentName || sourceCard.querySelector("h4")?.textContent?.trim() || "Resident";
            const apartment = sourceCard.dataset.residentApartmentLabel || "";
            const phone = sourceCard.dataset.residentPhone || "";
            const lastPayment = "";
            const balance = sourceCard.querySelector(".resident-list-balance strong")?.textContent?.trim() || "";
            const statusValue = sourceCard.dataset.residentStatus || "paid";
            const status = statusValue === "debtor" ? "DEBTORS" : "PAID";
            const avatarImage = sourceCard.querySelector("img.h-12.w-12");
            const avatarInitials = name.split(" ").map((part) => part[0] || "").join("").slice(0, 2).toUpperCase();

            return {
                name,
                apartment,
                phone,
                lastPayment,
                balance,
                status,
                statusValue,
                globalVisible: sourceCard.dataset.globalFilterHidden !== "true",
                avatarSrc: avatarImage?.getAttribute("src") || "",
                avatarInitials,
                searchText: `${name} ${apartment} ${phone} ${lastPayment} ${balance} ${status}`.toLowerCase(),
            };
        };

        const buildResidentCard = (resident) => {
            return `
                <article class="resident-view-item" data-resident-status="${resident.statusValue}">
                    <div class="resident-view-item-main">
                        ${resident.avatarSrc
                            ? `<img class="resident-view-avatar" src="${resident.avatarSrc}" alt="">`
                            : `<span class="resident-view-avatar resident-view-avatar-initials">${resident.avatarInitials}</span>`}
                        <div class="resident-view-content">
                            <div class="resident-view-row resident-view-row-top">
                                <h4>${resident.name}</h4>
                                <span class="resident-view-status" data-i18n-key="${resident.status}">${resident.status}</span>
                            </div>
                            <p class="resident-view-apartment">${resident.apartment}</p>
                            <div class="resident-view-meta">
                                <span><strong data-i18n-key="Phone:">Phone:</strong> ${resident.phone}</span>
                                <span><strong data-i18n-key="Last Payment:">Last Payment:</strong> ${resident.lastPayment}</span>
                                <span><strong data-i18n-key="Current Balance">Current Balance</strong> ${resident.balance}</span>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        };

        const renderResidents = () => {
            const query = search?.value.trim().toLowerCase() || "";
            const residents = Array.from(document.querySelectorAll("[data-resident-grid] [data-resident-card]")).map(readResidentCard);
            const filtered = residents.filter((resident) => {
                const statusMatch = activeFilter === "all" || resident.statusValue === activeFilter;
                const queryMatch = !query || resident.searchText.includes(query);
                return resident.globalVisible && statusMatch && queryMatch;
            });
            list.innerHTML = filtered.map(buildResidentCard).join("");
            const visibleCount = filtered.length;
            count.textContent = countLabel(visibleCount);
            search?.closest(".resident-search-shell")?.classList.toggle("has-value", Boolean(query));
            empty?.classList.toggle("hidden", visibleCount > 0);
            window.HydroFlowSyncLocale?.();
        };

        openButton.addEventListener("click", renderResidents);
        search?.addEventListener("input", renderResidents);
        clearSearch?.addEventListener("click", () => {
            if (!search) return;
            search.value = "";
            search.focus();
            renderResidents();
        });
        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                activeFilter = button.dataset.allResidentsFilter || "all";
                filterButtons.forEach((item) => {
                    const active = item === button;
                    item.classList.toggle("is-active", active);
                    item.setAttribute("aria-pressed", String(active));
                });
                renderResidents();
            });
        });

        document.querySelectorAll("[data-resident-filter], [data-resident-search], [data-resident-search-clear], [data-lang-toggle]").forEach((control) => {
            const eventName = control.matches("[data-resident-search]") ? "input" : "click";
            control.addEventListener(eventName, () => {
                if (modal.classList.contains("is-open")) renderResidents();
            });
        });
    };

    const setupResidentBillingHistory = () => {
        const grid = document.querySelector("[data-resident-grid]");
        if (!grid || grid.dataset.billingHistoryReady === "true") return;
        grid.dataset.billingHistoryReady = "true";
        grid.querySelectorAll("[data-resident-billing-history]").forEach((button) => {
            button.removeAttribute("data-detail-open");
        });
        const historyModal = document.getElementById("resident-transactions-modal");
        const historyList = historyModal?.querySelector("[data-resident-transactions-list]");
        const historyEmpty = historyModal?.querySelector("[data-resident-transactions-empty]");
        const historySubtitle = historyModal?.querySelector("[data-resident-transactions-subtitle]");
        const historyTitle = historyModal?.querySelector("#resident-transactions-title");
        let activeHistoryResident = null;
        const historyText = (value) => translateValue(String(value || ""), storage.getItem("hydroflow-lang") || "en");

        const parseResident = (card) => {
            const resident = getResidentById(card.dataset.residentId);
            if (resident) return resident;
            const ownerBackendId = Number(card.dataset.ownerBackendId || 0);
            const parsedName = card.dataset.residentName || card.querySelector("h4")?.textContent.trim() || "Resident";
            const parsedPhone = card.dataset.residentPhone || "";
            const fallbackResident = billingData.residents.find((item) =>
                (ownerBackendId && Number(item.ownerBackendId || item.backendId || 0) === ownerBackendId)
                || (item.name === parsedName && (!parsedPhone || item.phone === parsedPhone))
            );
            if (fallbackResident) return fallbackResident;
            const balanceText = card.querySelector(".resident-list-balance strong")?.textContent || "";
            const balance = Number(balanceText.replace(/[^\d.-]/g, "")) || 0;
            return {
                id: card.dataset.residentId || "",
                displayId: card.querySelector(".resident-list-id strong")?.textContent.trim() || "",
                backendId: card.dataset.ownerBackendId || "",
                ownerBackendId: card.dataset.ownerBackendId || "",
                name: parsedName,
                apartment: card.dataset.residentApartmentLabel || "",
                apartmentNumber: card.dataset.residentApartmentLabel || "",
                phone: parsedPhone,
                building: card.dataset.residentBuilding || "",
                complex: card.dataset.residentComplex || "",
                balance,
                status: card.dataset.residentStatus === "debtor" ? "debtor" : "paid",
                complexId: card.dataset.complexId || "",
            };
        };
        const historyRowMarkup = (payment) => {
            const signedAmount = Number(payment.signedAmount ?? payment.amount ?? 0);
            const amountTone = signedAmount >= 0 ? "is-positive" : "is-negative";
            const amountPrefix = signedAmount >= 0 ? "+" : "";
            const transactionId = payment.backendId || payment.id || "--";
            const paymentTime = payment.createdAt || payment.date || "--";
            const balanceBefore = Number(payment.balanceBefore || 0);
            const balanceAfter = Number(payment.balanceAfter || 0);
            // Ledger rows written by the system (billing, imports) have no operator.
            const operator = payment.createdBy || historyText("System");
            const paymentType = historyText(payment.method || payment.type || "Transaction");
            return `
                <div class="resident-transaction-item">
                    <div class="resident-transaction-cell resident-transaction-cell-id">
                        <span class="table-cell-label" data-i18n-key="ID">ID</span>
                        <strong>${escapeHtml(transactionId)}</strong>
                    </div>
                    <div class="resident-transaction-cell resident-transaction-cell-datetime">
                        <span class="table-cell-label" data-i18n-key="Date time">Date time</span>
                        <strong>${escapeHtml(paymentTime)}</strong>
                    </div>
                    <div class="resident-transaction-cell resident-transaction-cell-operator">
                        <span class="table-cell-label" data-i18n-key="Operator">Operator</span>
                        <strong>${escapeHtml(operator)}</strong>
                    </div>
                    <div class="resident-transaction-cell resident-transaction-cell-type">
                        <span class="table-cell-label" data-i18n-key="Payment type">Payment type</span>
                        <strong>${escapeHtml(paymentType)}</strong>
                    </div>
                    <div class="resident-transaction-cell resident-transaction-cell-amount">
                        <span class="table-cell-label" data-i18n-key="Amount">Amount</span>
                        <strong class="resident-transaction-amount ${amountTone}">${amountPrefix}${formatBillingUzs(Math.abs(signedAmount))}</strong>
                    </div>
                    <div class="resident-transaction-cell resident-transaction-cell-balance resident-transaction-cell-before">
                        <span class="table-cell-label" data-i18n-key="Balance before">Balance before</span>
                        <strong class="${balanceBefore < 0 ? "is-negative" : "is-positive"}">${formatBillingUzs(balanceBefore)}</strong>
                    </div>
                    <div class="resident-transaction-cell resident-transaction-cell-balance resident-transaction-cell-after">
                        <span class="table-cell-label" data-i18n-key="Balance after">Balance after</span>
                        <strong class="${balanceAfter < 0 ? "is-negative" : "is-positive"}">${formatBillingUzs(balanceAfter)}</strong>
                    </div>
                </div>
            `;
        };
        let shownHistoryRows = [];
        const renderHistoryRows = (rows) => {
            shownHistoryRows = rows;
            if (historyList) historyList.innerHTML = rows.map(historyRowMarkup).join("");
            historyEmpty?.classList.toggle("hidden", rows.length > 0);
            window.HydroFlowSyncLocale?.();
        };
        // The snapshot keeps only the latest rows of each account; the whole account history is paged in
        // from the list API (apartment_id: the account, which also covers a vacant apartment).
        const loadResidentHistoryRows = async (resident) => {
            const scope = resident.apartmentBackendId
                ? { apartment_id: resident.apartmentBackendId }
                : { owner_id: resident.ownerBackendId || resident.backendId };
            const rows = [];
            for (let page = 1; page <= 50; page += 1) {
                const payload = await fetchServerList("/api/lists/transactions/", { ...scope, page, page_size: 100, ordering: "-created_at" });
                rows.push(...(payload.results || []));
                if (page >= Number(payload.pages || 1)) break;
            }
            return rows;
        };
        let historyRequestId = 0;
        const openResidentHistory = (resident) => {
            if (!historyModal || !resident) return;
            activeHistoryResident = resident;
            const requestId = ++historyRequestId;
            if (historyTitle) historyTitle.textContent = resident.name || "Resident transactions";
            if (historySubtitle) {
                historySubtitle.textContent = [resident.building, resident.apartment].filter(Boolean).join(" · ") || "Live transaction history from database.";
            }
            // Show the rows the snapshot already has at once, then swap in the full history.
            renderHistoryRows(getResidentTransactions(resident.id)
                .slice()
                .sort((a, b) => transactionDateValue(b.createdAt || b.date) - transactionDateValue(a.createdAt || a.date)));
            openOverlayById("resident-transactions-modal");
            if (!resident.apartmentBackendId && !resident.ownerBackendId && !resident.backendId) return;
            loadResidentHistoryRows(resident)
                .then((rows) => {
                    if (requestId === historyRequestId) renderHistoryRows(rows);
                })
                .catch(() => {
                    // Keep the snapshot rows if the list request fails.
                });
        };
        // A language switch re-renders the rows already shown; it must not reopen the window.
        document.addEventListener("hydroflow:language-changed", () => {
            if (historyModal?.classList.contains("is-open")) renderHistoryRows(shownHistoryRows);
        });
        const pickResidentByOwnerId = (value) => {
            const ownerId = String(value || "").replace(/[^\d]/g, "");
            if (!ownerId) return null;
            return billingData.residents.find((item) => String(item.ownerBackendId || item.backendId || "").replace(/[^\d]/g, "") === ownerId) || null;
        };
        const resolveResidentForHistory = (source) => {
            if (!source) return null;
            if (typeof source === "string") {
                return getResidentById(source) || pickResidentByOwnerId(source);
            }
            const byId = source.id ? getResidentById(source.id) : null;
            if (byId) return byId;
            const ownerId = source.ownerBackendId || source.backendId || source.displayId || source.residentBackendId || source.ownerId || "";
            const byOwner = pickResidentByOwnerId(ownerId);
            if (byOwner) return byOwner;
            if (typeof source !== "object") return null;
            const normalizedOwnerId = String(ownerId || "").replace(/[^\d]/g, "");
            return {
                ...source,
                id: source.id || (normalizedOwnerId ? `owner-${normalizedOwnerId}` : ""),
                displayId: source.displayId || normalizedOwnerId || "--",
                ownerBackendId: source.ownerBackendId || normalizedOwnerId,
                backendId: source.backendId || normalizedOwnerId,
                apartment: source.apartment || source.apartmentNumber || "",
                apartmentNumber: source.apartmentNumber || source.apartment || "",
                building: source.building || "",
                phone: source.phone || "",
                name: source.name || "Resident",
                balance: Number(source.balance || 0),
            };
        };
        window.HydroFlowOpenResidentHistory = (source) => {
            const resolved = resolveResidentForHistory(source);
            if (!resolved) return;
            openResidentHistory(resolved);
        };

        grid.addEventListener("click", (event) => {
            const button = event.target.closest("[data-resident-billing-history]");
            if (!button) return;
            const card = button.closest("[data-resident-card]");
            if (!card) return;
            event.preventDefault();
            event.stopPropagation();
            const resident = parseResident(card);
            openResidentHistory(resident);
        });
    };

    function setupResidentialHierarchy() {
        const table = document.querySelector(".residential-performance-table")
            || document.querySelector("[data-drill-row='district']")?.closest("table");
        if (!table) return;
        const body = table.querySelector("tbody");
        if (!body) return;
        table.HydroFlowResidentialCleanup?.();
        const cleanupHandlers = [];
        const listen = (target, type, handler, options) => {
            if (!target) return;
            target.addEventListener(type, handler, options);
            cleanupHandlers.push(() => target.removeEventListener(type, handler, options));
        };

        const singleSector = getSingleSectorStats();
        const districts = {
            [SINGLE_SECTOR_ID]: {
                complex: singleSector.name,
                sector: singleSector.sector,
                prefix: singleSector.prefix,
                count: singleSector.buildings,
                units: singleSector.units,
                risk: singleSector.risk,
                tone: singleSector.tone,
                debt: singleSector.finances,
                issueEvery: 0,
                buildingItems: singleSector.buildingItems || [],
            },
        };

        const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        }[char]));
        const attr = escapeHtml;
        const formatUzs = (value) => `${Number(value || 0).toLocaleString("en-US")} UZS`;
        const initialFor = (name) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
        const systemStatePillClass = (value) => {
            const normalized = String(value || "").toLowerCase();
            if (normalized.includes("leak")) return "is-critical";
            if (normalized.includes("maintenance")) return "is-medium";
            if (normalized.includes("review")) return "is-review";
            return "";
        };
        const renderSystemState = (labelKey, value) => `
            <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tight">
                    <span data-i18n-key="${attr(labelKey)}">${escapeHtml(labelKey)}</span>:
                </span>
                <span class="residential-risk-pill ${systemStatePillClass(value)}" data-i18n-key="${attr(value)}">${escapeHtml(value)}</span>
            </div>
        `;
        const unitsForBuilding = (district, index) => {
            const realBuilding = district.buildingItems?.[index - 1];
            // Rows exist only for real apartments, so apartmentFor() never runs past this count.
            return realBuilding?.apartments?.length || 0;
        };
        const buildingName = (district, index) => {
            const realBuilding = district.buildingItems?.[index - 1];
            return realBuilding?.name || `House ${realBuilding?.number || index}`;
        };
        const apartmentFor = (districtId, buildingIndex, unitIndex) => {
            const district = districts[districtId];
            const realApartment = district?.buildingItems?.[buildingIndex - 1]?.apartments?.[unitIndex - 1];
            if (realApartment) {
                return {
                    unit: realApartment.unit,
                    owner: {
                        name: realApartment.owner?.name || "Unassigned owner",
                        phone: realApartment.owner?.phone || "",
                        email: realApartment.owner?.email || "",
                        photo: realApartment.owner?.photo || "",
                        telegramUser: realApartment.owner?.telegramUser || "",
                        telegramConnected: Boolean(realApartment.owner?.telegramConnected),
                    },
                    ownerBackendId: realApartment.ownerBackendId || "",
                    apartmentBackendId: realApartment.apartmentBackendId || realApartment.backendId || "",
                    buildingBackendId: realApartment.buildingBackendId || "",
                    complexBackendId: realApartment.complexBackendId || "",
                    balance: Number(realApartment.balance || 0),
                    status: realApartment.status || "Paid",
                    rooms: realApartment.rooms || "Apartment",
                    area: realApartment.area || "",
                    personalAccount: realApartment.personalAccount || "",
                    charge: realApartment.charge ? String(realApartment.charge) : "",
                    meter: realApartment.meter || "",
                    contract: realApartment.contract || "",
                    visit: realApartment.visit || "",
                    lastPayment: realApartment.lastPayment || "",
                    occupancy: realApartment.occupancy || "Resident",
                };
            }
            return null;
        };

        const makeSelectCell = (label) => table.querySelector("[data-select-all]")
            ? `<td class="px-4 py-4"><input aria-label="${attr(label)}" data-row-select type="checkbox"></td>`
            : "";
        const debtSplitMarkup = (debtorCount, paidCount, tone) => `
            <div class="resident-debt-split ${tone}" aria-label="${debtorCount} debtors and ${paidCount} paid residents">
                <span><b>${debtorCount}</b><small data-i18n-key="Debt">Debt</small></span>
                <span><b>${paidCount}</b><small data-i18n-key="Paid">Paid</small></span>
            </div>
        `;
        const fillBuildingSummaryModal = (trigger) => {
            const modal = document.getElementById("building-summary-modal");
            if (!modal || !trigger) return;
            const apartments = Number(trigger.dataset.buildingApartments || 0);
            const area = Number(trigger.dataset.buildingArea || 0);
            const debtors = Number(trigger.dataset.buildingDebtors || 0);
            const paid = Number(trigger.dataset.buildingPaid || 0);
            const debt = Number(trigger.dataset.buildingDebt || 0);
            const title = trigger.dataset.buildingName || "House";
            const complex = trigger.dataset.buildingComplex || "";
            const subtitle = complex || "Residential building summary from backend data.";
            const periodsLink = modal.querySelector("[data-building-summary-periods]");

            modal.querySelectorAll("[data-building-summary-card-title]").forEach((node) => {
                node.textContent = title;
            });
            modal.querySelectorAll("[data-building-summary-card-subtitle]").forEach((node) => {
                node.textContent = subtitle;
            });
            modal.querySelector("[data-building-summary-apartments]").textContent = moneyFormatter.format(apartments);
            modal.querySelector("[data-building-summary-area]").textContent = formatAreaM2(area);
            modal.querySelector("[data-building-summary-debtors]").textContent = moneyFormatter.format(debtors);
            modal.querySelector("[data-building-summary-paid]").textContent = moneyFormatter.format(paid);
            modal.querySelector("[data-building-summary-debt]").textContent = formatBillingUzs(debt);
            if (periodsLink) {
                periodsLink.href = "/billing/periods/";
                periodsLink.dataset.buildingBackendId = trigger.dataset.buildingBackendId || "";
            }
            window.HydroFlowSyncLocale?.();
        };

        const renderOwner = (owner) => {
            const vacant = owner.name === "Unassigned owner";
            const avatar = owner.photo
                ? `<img class="residential-owner-photo" src="${attr(owner.photo)}" alt="">`
                : `<span class="residential-owner-initials">${escapeHtml(initialFor(owner.name))}</span>`;
            return `
                <div class="residential-owner-cell">
                    ${avatar}
                    <div>
                        <strong${vacant ? ' data-i18n-key="Unassigned owner"' : ""}>${escapeHtml(vacant ? t(owner.name) : owner.name)}</strong>
                        ${owner.phone ? `<span class="resident-phone-line">
                            <span class="material-symbols-outlined" aria-hidden="true">call</span>
                            <b>${escapeHtml(owner.phone)}</b>
                            <button aria-label="Copy ${attr(owner.name)} phone number" class="resident-copy-phone" data-copy-phone="${attr(owner.phone)}" type="button">
                                <span class="material-symbols-outlined" aria-hidden="true">content_copy</span>
                            </button>
                        </span>` : ""}
                    </div>
                </div>
            `;
        };

        const normalizeBuildingLabel = (value, fallback = "") => {
            const source = String(value ?? "").trim();
            if (!source) return String(fallback || "").trim();
            const numberLike = source.match(/\d[\dA-Za-z/-]*/);
            if (numberLike?.[0]) return numberLike[0];
            const withoutPrefix = source.replace(/^\s*(?:house|dom|uy)\s*/i, "").trim();
            return withoutPrefix || source;
        };

        const renderBuildingRow = (districtId, index) => {
            const district = districts[districtId];
            const realBuilding = district.buildingItems?.[index - 1];
            const rawBuildingName = buildingName(district, index);
            const buildingLabel = normalizeBuildingLabel(realBuilding?.number || rawBuildingName || index, rawBuildingName || index);
            const unitCount = unitsForBuilding(district, index);
            const healthIssue = realBuilding ? realBuilding.risk === "Critical" : district.issueEvery && index % district.issueEvery === 0;
            const debt = realBuilding ? realBuilding.debt : Math.round(district.debt / district.count) + (healthIssue ? 4200000 : index * 175000);
            const debtorCount = realBuilding ? realBuilding.debtorResidents : Math.max(1, Math.round(unitCount * (healthIssue ? 0.24 : districtId === "harbor" ? 0.17 : 0.07)));
            const paidCount = realBuilding ? realBuilding.paidResidents : Math.max(0, unitCount - debtorCount);
            const residentCount = debtorCount + paidCount;
            const splitRatio = paidCount === 0 ? Infinity : debtorCount / paidCount;
            const splitTone = splitRatio > 1 ? "is-danger" : splitRatio >= 0.75 ? "is-caution" : "is-healthy";
            const buildingRisk = realBuilding?.risk || (healthIssue ? "Review" : district.risk);
            const buildingRiskClass = buildingRisk === "Critical" ? "is-critical" : buildingRisk === "Medium Risk" ? "is-medium" : "";
            const totalArea = Number(realBuilding?.totalArea || 0);
            const row = document.createElement("tr");
            row.className = "residential-drill-row residential-building-row";
            row.dataset.drillChild = "true";
            row.dataset.drillRow = "building";
            row.dataset.parentDistrict = districtId;
            row.dataset.buildingId = `${districtId}-${index}`;
            row.dataset.buildingIndex = String(index);
            row.dataset.backendId = String(realBuilding?.backendId || "");
            row.dataset.backendType = "building";
            row.dataset.sortName = buildingLabel;
            row.dataset.sortBuildings = "1";
            row.dataset.sortUnits = String(unitCount);
            row.dataset.sortHealth = String(residentCount);
            row.dataset.sortResidents = String(residentCount);
            row.dataset.sortArea = String(totalArea);
            row.dataset.sortFinance = String(debt);
            row.dataset.sortDebt = String(debt);
            row.dataset.sortDebtors = String(debtorCount);
            row.dataset.sortPaid = String(paidCount);
            row.setAttribute("aria-expanded", "false");
            row.tabIndex = 0;
            row.innerHTML = `
                ${makeSelectCell(`Select ${buildingLabel}`)}
                <td class="px-6 py-4 residential-building-summary-cell">
                    <div class="residential-nested-name">
                        <span class="material-symbols-outlined residential-drill-chevron" aria-hidden="true">expand_more</span>
                        <div class="residential-building-trigger"
                            data-building-summary-open
                            data-building-name="${attr(buildingLabel)}"
                            data-building-complex="${attr(realBuilding?.parentComplexName || district.complex)}"
                            data-building-apartments="${attr(unitCount)}"
                            data-building-area="${attr(totalArea)}"
                            data-building-residents="${attr(residentCount)}"
                            data-building-debtors="${attr(debtorCount)}"
                            data-building-paid="${attr(paidCount)}"
                            data-building-debt="${attr(debt)}"
                            data-building-backend-id="${attr(realBuilding?.backendId || "")}">
                            <p>${escapeHtml(buildingLabel)}</p>
                            <small>${escapeHtml(realBuilding?.parentComplexName || district.complex)}</small>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <p class="text-sm font-bold text-on-surface">
                        ${moneyFormatter.format(unitCount)}
                        <span class="text-xs font-normal text-on-surface-variant" data-i18n-key="Apartments">Apartments</span>
                    </p>
                </td>
                <td class="px-6 py-4">
                    <p class="text-sm font-bold text-on-surface">${formatAreaM2(totalArea)}</p>
                </td>
                <td class="px-6 py-4">
                    <div class="residential-debt-inline">
                        <p class="text-sm font-bold ${healthIssue ? "text-error" : "text-on-surface"}">${formatUzs(debt)}</p>
                        <span class="residential-risk-pill ${buildingRiskClass}" data-i18n-key="${buildingRisk}">${buildingRisk}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="residential-action-cell">
                        ${debtSplitMarkup(debtorCount, paidCount, splitTone)}
                    <button class="residential-open-button" data-i18n-key="Apartments" type="button">Apartments</button>
                    </div>
                </td>
            `;
            return row;
        };

        const renderApartmentRow = (districtId, buildingIndex, unitIndex) => {
            const district = districts[districtId];
            const apartment = apartmentFor(districtId, buildingIndex, unitIndex);
            const building = buildingName(district, buildingIndex);
            const row = document.createElement("tr");
            row.className = "residential-drill-row residential-apartment-row";
            row.dataset.drillChild = "true";
            row.dataset.drillRow = "apartment";
            row.dataset.parentDistrict = districtId;
            row.dataset.parentBuilding = `${districtId}-${buildingIndex}`;
            row.dataset.backendId = String(apartment.apartmentBackendId || "");
            row.dataset.backendType = "apartment";
            row.innerHTML = `
                ${makeSelectCell(`Select apartment ${apartment.unit}`)}
                <td class="px-6 py-4">${renderOwner(apartment.owner)}</td>
                <td class="px-6 py-4"><p class="text-sm font-bold text-on-surface">${escapeHtml(apartment.unit)}</p><p class="text-xs text-on-surface-variant" data-i18n-key="Apartment">Apartment</p></td>
                <td class="px-6 py-4"><p class="text-sm font-bold text-on-surface">${escapeHtml(apartment.area)}</p><p class="text-xs text-on-surface-variant" data-i18n-key="Area (m²)">Area (m²)</p></td>
                <td class="px-6 py-4"><p class="text-sm font-bold ${apartment.balance < 0 ? "text-error" : "text-on-surface"}">${formatUzs(apartment.balance)}</p><span class="residential-risk-pill ${apartment.status === "Overdue" ? "is-critical" : "is-paid"}" data-i18n-key="${attr(apartment.status)}">${escapeHtml(apartment.status)}</span></td>
                <td class="px-6 py-4 text-right">
                    <button class="residential-detail-button" data-apartment-details
                        data-title="Apartment ${attr(apartment.unit)}"
                        data-subtitle="${attr(building)} · ${attr(district.complex)}"
                        data-owner="${attr(apartment.owner.name)}"
                        data-photo="${attr(apartment.owner.photo)}"
                        data-phone="${attr(apartment.owner.phone)}"
                        data-telegram-user="${attr(apartment.owner.telegramUser)}"
                        data-telegram-connected="${apartment.owner.telegramConnected ? "true" : ""}"
                        data-balance="${attr(formatUzs(apartment.balance))}"
                        data-status="${attr(apartment.status)}"
                        data-unit="${attr(apartment.unit)}"
                        data-area="${attr(apartment.area)}"
                        data-personal-account="${attr(apartment.personalAccount)}"
                        data-contract="${attr(apartment.contract)}"
                        data-payment="${attr(apartment.lastPayment)}"
                        data-owner-backend-id="${attr(apartment.ownerBackendId || "")}"
                        data-apartment-backend-id="${attr(apartment.apartmentBackendId || "")}"
                        data-building-backend-id="${attr(apartment.buildingBackendId || "")}"
                        data-complex-backend-id="${attr(apartment.complexBackendId || "")}"
                        data-i18n-key="Details"
                        type="button">Details</button>
                </td>
            `;
            return row;
        };

        const removeRows = (selector) => body.querySelectorAll(selector).forEach((row) => row.remove());
        const refreshResidentialTableControls = () => {
            table.HydroFlowRefreshTableControls?.();
        };
        const collapseBuilding = (row) => {
            row?.classList.remove("is-expanded");
            row?.setAttribute("aria-expanded", "false");
            if (row?.dataset.buildingId) removeRows(`[data-parent-building="${row.dataset.buildingId}"]`);
            refreshResidentialTableControls();
        };
        const collapseDistrict = (row) => {
            row?.classList.remove("is-expanded");
            row?.setAttribute("aria-expanded", "false");
            if (row?.dataset.districtId) removeRows(`[data-parent-district="${row.dataset.districtId}"]`);
            refreshResidentialTableControls();
        };
        const collapseAll = () => {
            table.querySelectorAll("[data-drill-row='district']").forEach(collapseDistrict);
        };
        const getDistrictRows = () => Array.from(table.querySelectorAll("[data-drill-row='district']"));
        const isRootSectorRow = (row) => row?.dataset?.districtId === SINGLE_SECTOR_ID;
        const expandDistrict = (row) => {
            const district = districts[row.dataset.districtId];
            if (!district) return;
            removeRows(`[data-parent-district="${row.dataset.districtId}"]`);
            const fragment = document.createDocumentFragment();
            for (let index = 1; index <= district.count; index += 1) {
                fragment.appendChild(renderBuildingRow(row.dataset.districtId, index));
            }
            row.after(fragment);
            row.classList.add("is-expanded");
            if (isRootSectorRow(row)) row.classList.add("hidden");
            row.setAttribute("aria-expanded", "true");
            refreshResidentialTableControls();
            window.HydroFlowSyncLocale?.();
        };
        const expandBuilding = (row) => {
            const districtId = row.dataset.parentDistrict;
            const buildingIndex = Number(row.dataset.buildingIndex);
            const district = districts[districtId];
            if (!district) return;
            const fragment = document.createDocumentFragment();
            for (let index = 1; index <= unitsForBuilding(district, buildingIndex); index += 1) {
                fragment.appendChild(renderApartmentRow(districtId, buildingIndex, index));
            }
            row.after(fragment);
            row.classList.add("is-expanded");
            row.setAttribute("aria-expanded", "true");
            refreshResidentialTableControls();
            window.HydroFlowSyncLocale?.();
        };

        const searchInput = table.closest(".table-workspace")?.parentElement?.querySelector(".table-search");
        if (searchInput) {
            const searchPlaceholderKey = "Search";
            const currentLang = storage.getItem("hydroflow-lang") || "en";
            searchInput.placeholder = currentLang === "en" ? searchPlaceholderKey : placeholderTranslations[searchPlaceholderKey]?.[currentLang] || searchPlaceholderKey;
            searchInput.dataset.i18nPlaceholder = searchPlaceholderKey;
            searchInput.setAttribute("aria-label", "Search district, house, apartment or resident");
            searchInput.closest(".table-search-shell")?.classList.add("residential-smart-search-shell");
            const pendingCommandQuery = storage.getItem("hydroflow-command-query-pending") || "";
            if (pendingCommandQuery) {
                storage.removeItem("hydroflow-command-query-pending");
                window.requestAnimationFrame(() => {
                    searchInput.value = pendingCommandQuery;
                    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
                    searchInput.focus();
                });
            }
        }
        const syncResidentialLabels = (lang = storage.getItem("hydroflow-lang") || "en") => {
            const labels = {
                en: ["House", "Apts", "Area", "Debt"],
                ru: ["Дом", "Кв.", "Площадь", "Долг"],
                uz: ["Uy", "Kv.", "Maydon", "Qarz"],
            };
            const fullLabels = ["House Name", "Apartments", "Area", "Debt Status"];
            table.querySelectorAll(".table-filter-heading-text").forEach((label, index) => {
                label.textContent = labels[lang]?.[index] || labels.en[index] || label.textContent;
                label.title = fullLabels[index] || label.textContent;
            });
        };
        window.HydroFlowSyncResidentialLabels = syncResidentialLabels;
        syncResidentialLabels();
        const searchableText = (...values) => values.filter(Boolean).join(" ").toLowerCase();
        const showNoResults = (query) => {
            const colSpan = table.querySelector("thead tr")?.cells.length || 7;
            const row = document.createElement("tr");
            row.className = "residential-smart-empty";
            row.dataset.smartEmpty = "true";
            row.innerHTML = `
                <td colspan="${colSpan}">
                    <div>
                        <span class="material-symbols-outlined">search_off</span>
                        <strong>No matching buildings or residents</strong>
                        <small>Nothing found for "${escapeHtml(query)}". Try owner name, apartment number, phone or building.</small>
                    </div>
                </td>
            `;
            body.appendChild(row);
        };
        const resetSmartSearch = () => {
            table.classList.remove("residential-smart-search-active");
            removeRows("[data-drill-child='true'], [data-smart-empty='true']");
            getDistrictRows().forEach((row) => {
                row.classList.remove("is-expanded", "residential-smart-match");
                row.classList.toggle("hidden", row.dataset.globalFilterHidden === "true");
                row.setAttribute("aria-expanded", "false");
            });
        };
        const runSmartSearch = () => {
            if (!searchInput) return;
            const query = searchInput.value.trim().toLowerCase();
            resetSmartSearch();
            if (!query) {
                const rootSectorRow = getDistrictRows()[0];
                if (rootSectorRow && !rootSectorRow.classList.contains("is-expanded")) {
                    expandDistrict(rootSectorRow);
                }
                refreshResidentialTableControls();
                return;
            }

            table.classList.add("residential-smart-search-active");
            let visibleCount = 0;

            getDistrictRows().forEach((districtRow) => {
                const districtId = districtRow.dataset.districtId;
                if (districtRow.dataset.globalFilterHidden === "true") {
                    districtRow.classList.add("hidden");
                    return;
                }
                const district = districts[districtId];
                if (!district) return;
                const districtText = searchableText(district.complex, district.sector, district.prefix);
                const districtMatches = districtText.includes(query);
                const fragment = document.createDocumentFragment();
                let hasChildMatch = false;

                for (let buildingIndex = 1; buildingIndex <= district.count; buildingIndex += 1) {
                    const building = buildingName(district, buildingIndex);
                    const buildingText = searchableText(building, district.complex, district.sector, `${buildingIndex}`, `${unitsForBuilding(district, buildingIndex)} apartments`);
                    const buildingMatches = buildingText.includes(query);
                    const apartmentRows = [];

                    for (let unitIndex = 1; unitIndex <= unitsForBuilding(district, buildingIndex); unitIndex += 1) {
                        const apartment = apartmentFor(districtId, buildingIndex, unitIndex);
                        const apartmentText = searchableText(
                            apartment.unit,
                            `apartment ${apartment.unit}`,
                            apartment.owner.name,
                            apartment.owner.phone,
                            apartment.owner.email,
                            apartment.contract,
                            apartment.meter,
                            apartment.status,
                            apartment.occupancy,
                            building,
                            district.complex,
                        );
                        if (apartmentText.includes(query)) {
                            const apartmentRow = renderApartmentRow(districtId, buildingIndex, unitIndex);
                            apartmentRow.classList.add("residential-smart-match");
                            apartmentRows.push(apartmentRow);
                        }
                    }

                    if (districtMatches || buildingMatches || apartmentRows.length) {
                        const buildingRow = renderBuildingRow(districtId, buildingIndex);
                        buildingRow.classList.add("residential-smart-match");
                        if (apartmentRows.length) {
                            buildingRow.classList.add("is-expanded");
                            buildingRow.setAttribute("aria-expanded", "true");
                        }
                        fragment.appendChild(buildingRow);
                        apartmentRows.forEach((row) => fragment.appendChild(row));
                        hasChildMatch = true;
                    }
                }

                if (districtMatches || hasChildMatch) {
                    visibleCount += 1;
                    districtRow.classList.toggle("hidden", isRootSectorRow(districtRow));
                    districtRow.classList.add("is-expanded", "residential-smart-match");
                    districtRow.setAttribute("aria-expanded", "true");
                    districtRow.after(fragment);
                } else {
                    districtRow.classList.add("hidden");
                }
            });

            if (!visibleCount) showNoResults(searchInput.value.trim());
            refreshResidentialTableControls();
            window.HydroFlowSyncLocale?.();
        };

        listen(table, "click", (event) => {
            if (event.target.closest(".residential-drill-chevron")) return;
            const trigger = event.target.closest("[data-building-summary-open]");
            if (trigger) {
                event.preventDefault();
                event.stopImmediatePropagation();
                fillBuildingSummaryModal(trigger);
                openOverlayById("building-summary-modal");
                return;
            }
        });

        listen(table, "click", (event) => {
            if (event.target.closest("button, a, input, label, select")) return;
            const building = event.target.closest("[data-drill-row='building']");
            if (building) {
                building.classList.contains("is-expanded") ? collapseBuilding(building) : expandBuilding(building);
                return;
            }
            const district = event.target.closest("[data-drill-row='district']");
            if (district) {
                district.classList.contains("is-expanded") ? collapseDistrict(district) : expandDistrict(district);
            }
        });

        listen(table, "click", (event) => {
            const button = event.target.closest(".residential-open-button");
            if (!button) return;
            const row = button.closest("[data-drill-row='building']");
            row?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });

        listen(table, "keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            const row = event.target.closest("[data-drill-row='district'], [data-drill-row='building']");
            if (!row) return;
            event.preventDefault();
            row.click();
        });

        const rootSectorRow = getDistrictRows()[0];
        if (rootSectorRow && !rootSectorRow.classList.contains("is-expanded")) {
            expandDistrict(rootSectorRow);
        }
        refreshResidentialTableControls();

        const fillApartmentDrawer = (data) => {
            const drawer = document.getElementById("apartment-details-drawer");
            if (!drawer) return;
            drawer.dataset.ownerBackendId = data.ownerBackendId || "";
            drawer.dataset.apartmentBackendId = data.apartmentBackendId || "";
            drawer.dataset.buildingBackendId = data.buildingBackendId || "";
            drawer.dataset.complexBackendId = data.complexBackendId || "";
            const set = (selector, value) => {
                const element = drawer.querySelector(selector);
                if (element) element.textContent = value || "";
            };
            const localizedEmpty = () => {
                const lang = storage.getItem("hydroflow-lang") || "en";
                return lang === "ru" ? "Нет данных" : lang === "uz" ? "Ma'lumot yo'q" : "No data";
            };
            const ownerId = String(data.ownerBackendId || "");
            const apartmentId = String(data.apartmentBackendId || "");
            const ownerSlug = ownerId ? `owner-${ownerId}` : "";
            const rawContract = String(data.contract || "").trim();
            const lang = storage.getItem("hydroflow-lang") || "en";
            const yesLabel = lang === "ru" ? "Да" : lang === "uz" ? "Ha" : "Yes";
            const noLabel = lang === "ru" ? "Нет" : lang === "uz" ? "Yo'q" : "No";
            const contractLabel = t("Contract");
            const lastPaymentLabel = t("Last payment");
            const apartmentLabel = t("Apartment");
            const houseLabel = t("House");
            const contractValue = rawContract.toLowerCase() === "true"
                ? yesLabel
                : rawContract.toLowerCase() === "false"
                ? noLabel
                : rawContract;
            const localizeApartmentTitle = (value) => {
                const text = String(value || "").trim();
                if (!text) return "";
                return text.replace(/^Apartment\b/i, apartmentLabel);
            };
            const localizeHouseText = (value) => String(value || "").replace(/\bHouse\b/gi, houseLabel);
            // Recent activity: ledger entries of the apartment account (kind and signed amount; a balance
            // change has no status) and the resident's audit events by their translated title and who
            // did it. The backend's audit messages are English free text, so they are not shown, and
            // "Resident balance updated" is skipped: it repeats the ledger entry of the same payment.
            const realActivity = [
                ...(Array.isArray(billingData.transactions) ? billingData.transactions : [])
                    .filter((item) => String(item.apartmentBackendId || "") === apartmentId || String(item.ownerBackendId || "") === ownerId)
                    .map((item) => {
                        const signed = Number(item.signedAmount ?? item.amount ?? 0);
                        const prefix = signed > 0 ? "+" : signed < 0 ? "-" : "";
                        return {
                            time: item.createdAt || item.date || "",
                            text: `${t(item.method || item.type || "Transaction")}: ${prefix}${formatUzs(Math.abs(signed))}`,
                        };
                    }),
                ...(Array.isArray(billingData.auditEvents) ? billingData.auditEvents : [])
                    .filter((item) => item.ownerId === ownerSlug && item.title !== "Resident balance updated")
                    .map((item) => ({
                        time: item.time || "",
                        text: [t(item.title || item.label || "Audit event"), item.actor].filter(Boolean).join(" · "),
                    })),
            ].sort((a, b) => transactionDateValue(b.time) - transactionDateValue(a.time)).slice(0, 3);
            set("[data-apartment-title]", localizeApartmentTitle(data.title));
            set("[data-apartment-subtitle]", localizeHouseText(data.subtitle));
            set("[data-apartment-owner]", data.owner);
            set("[data-apartment-owner-meta]", contractValue ? `${contractLabel}: ${contractValue}` : localizedEmpty());
            set("[data-apartment-balance]", data.balance);
            set("[data-apartment-payment]", data.payment ? `${lastPaymentLabel} ${data.payment}` : localizedEmpty());
            set("[data-apartment-status]", data.status);
            set("[data-apartment-unit]", data.unit);
            set("[data-apartment-area]", data.area);
            set("[data-apartment-account]", data.personalAccount || localizedEmpty());
            set("[data-apartment-phone]", data.phone || localizedEmpty());
            set("[data-apartment-contract]", contractValue || localizedEmpty());
            // Same wording as the resident list: @username, "Not found" (connected without a username),
            // "Not linked" (not registered in the bot); a vacant apartment has nobody to connect.
            const telegram = { telegramUser: data.telegramUser, telegramConnected: data.telegramConnected === "true" };
            set("[data-apartment-telegram-status]", ownerId ? t(telegram.telegramConnected ? "Linked" : "Not linked") : localizedEmpty());
            set("[data-apartment-telegram-user]", ownerId ? telegramHandleText(telegram) : localizedEmpty());
            const activityList = drawer.querySelector(".apartment-activity-list");
            if (activityList) {
                activityList.innerHTML = realActivity.length
                    ? realActivity.map((item) => `
                        <div>
                            <time>${escapeHtml(item.time || localizedEmpty())}</time>
                            <p>${escapeHtml(item.text)}</p>
                        </div>
                    `).join("")
                    : `<div><time>${escapeHtml(localizedEmpty())}</time><p>${escapeHtml(localizedEmpty())}</p></div>`;
            }
            drawer.querySelectorAll("[data-apartment-owner-photo], [data-apartment-owner-photo-secondary]").forEach((img) => {
                if (data.photo) {
                    img.src = data.photo;
                    img.hidden = false;
                } else {
                    img.hidden = true;
                }
            });
            drawer.dataset.apartmentStatus = String(data.status || "").toLowerCase();
            window.HydroFlowSyncLocale?.();
        };

        listen(table, "click", (event) => {
            const button = event.target.closest("[data-apartment-details]");
            if (!button) return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            button.removeAttribute("data-detail-open");
            fillApartmentDrawer(button.dataset);
            openOverlayById("apartment-details-drawer");
        }, true);

        listen(table, "click", async (event) => {
            const button = event.target.closest("[data-copy-phone]");
            if (!button) return;
            event.preventDefault();
            event.stopPropagation();
            const phone = button.dataset.copyPhone || "";
            try {
                await navigator.clipboard?.writeText(phone);
                toast("Phone copied", phone, "success");
            } catch {
                toast("Phone number", phone, "info");
            }
        });

        listen(searchInput, "input", () => window.setTimeout(runSmartSearch, 0));
        listen(document, "keydown", (event) => {
            if (event.key === "Escape" && searchInput?.value && document.activeElement === searchInput) {
                searchInput.value = "";
                runSmartSearch();
            }
        });
        table.HydroFlowResidentialCleanup = () => {
            cleanupHandlers.splice(0).forEach((cleanup) => cleanup());
        };
    };

    const decorateStatusText = () => {
        const statusWords = ["Operational", "Maintenance", "Critical", "Warning", "Info", "Pending", "Success", "Completed", "Upcoming", "Review", "Failed"];
        const toneForStatus = (status) => {
            const value = String(status || "").toLowerCase();
            if (value.includes("critical") || value.includes("failed")) return "critical";
            if (value.includes("pending") || value.includes("maintenance") || value.includes("warning")) return "warning";
            if (value.includes("upcoming") || value.includes("review") || value.includes("info")) return "info";
            if (value.includes("completed") || value.includes("success") || value.includes("operational")) return "success";
            return "neutral";
        };
        document.querySelectorAll("span, p, strong").forEach((element) => {
            if (element.dataset.statusDecorated || element.children.length > 0) return;
            const text = element.textContent.trim();
            if (!statusWords.includes(text)) return;
            element.dataset.statusDecorated = "true";
            element.classList.add("table-assigned-status", `is-${toneForStatus(text)}`);
        });
    };

    const decorateRiskBadges = () => {
        const riskMap = {
            "low risk": "low",
            "critical": "critical",
            "medium risk": "medium",
        };
        document.querySelectorAll("span, p, small").forEach((element) => {
            const key = element.textContent.trim().toLowerCase();
            if (!riskMap[key]) return;
            element.classList.remove("risk-low", "risk-medium", "risk-critical");
            element.classList.add("risk-badge", `risk-${riskMap[key]}`);
        });
    };

    const addSparklines = () => {
        document.querySelectorAll(".motion-stagger h2, .motion-stagger h3").forEach((element) => {
            if (element.dataset.sparkline || element.children.length) return;
            if (!/\d/.test(element.textContent)) return;
            element.dataset.sparkline = "true";
            element.insertAdjacentHTML("beforeend", '<span class="sparkline" aria-hidden="true"><i></i><i></i><i></i><i></i></span>');
        });
    };

    setupServerLists();
    setupBillingDataSync();
    decorateStatusText();
    decorateRiskBadges();
    addSparklines();
    setupResidentFilters();
    setupResidentViewer();
    setupResidentBillingHistory();
    setupResidentialHierarchy();
    setupGlobalFilters();
    renderBackendNotifications();
    updateNotifications();
    window.requestAnimationFrame(() => {
        root.classList.remove("backend-hydrating");
        root.classList.add("backend-ready");
    });
    const liveStatsLockKey = "hydroflow-live-stats-lock";
    const liveStatsLockTtlMs = 20000;
    const liveStatsTabId = (() => {
        try {
            return crypto.randomUUID();
        } catch {
            return `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        }
    })();
    const readLiveStatsLock = () => {
        try {
            const raw = storage.getItem(liveStatsLockKey);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }
    const writeLiveStatsLock = (timestamp = Date.now()) => {
        storage.setItem(liveStatsLockKey, JSON.stringify({
            owner: liveStatsTabId,
            timestamp,
        }));
    };
    const claimLiveStatsLock = () => {
        const now = Date.now();
        const current = readLiveStatsLock();
        const currentOwner = String(current?.owner || "");
        const currentTimestamp = Number(current?.timestamp || 0);
        const expired = !currentTimestamp || (now - currentTimestamp) > liveStatsLockTtlMs;
        if (!currentOwner || expired || currentOwner === liveStatsTabId) {
            writeLiveStatsLock(now);
            return true;
        }
        return false;
    };
    const releaseLiveStatsLock = () => {
        const current = readLiveStatsLock();
        if (String(current?.owner || "") !== liveStatsTabId) return;
        storage.removeItem(liveStatsLockKey);
    };
    const liveStatsEnabledPages = new Set(["dashboard"]);
    const liveStatsEnabledForCurrentPage = () => liveStatsEnabledPages.has(String(document.body.dataset.activePage || "").trim());
    // The residents and transactions tables are paged from the server, so a snapshot refresh alone
    // updated the cards above them but not the rows (a resident added in admin appeared only after
    // reloading the page). A short fingerprint of what those tables show tells when to reload them,
    // without re-rendering them on every tick.
    const serverListFingerprint = (data) => {
        const residents = Array.isArray(data?.residents) ? data.residents : [];
        const transactions = Array.isArray(data?.transactions) ? data.transactions : [];
        const text = [
            residents.map((resident) => [
                resident.id, resident.name, resident.phone, resident.balance, resident.hasContract,
                resident.telegramStatus, resident.telegramUser, resident.building, resident.apartmentNumber,
            ].join("|")).join(";"),
            transactions.reduce((latest, item) => Math.max(latest, Number(item.backendId || 0)), 0),
        ].join("#");
        let hash = 5381;
        for (let index = 0; index < text.length; index += 1) hash = ((hash * 33) ^ text.charCodeAt(index)) >>> 0;
        return `${residents.length}:${hash}`;
    };
    let lastServerListFingerprint = serverListFingerprint(billingData);
    const refreshBackendData = async () => {
        if (document.body.dataset.backendRefreshRunning === "true") return;
        document.body.dataset.backendRefreshRunning = "true";
        try {
            const response = await fetch("/api/portal-data/", {
                cache: "no-store",
                credentials: "same-origin",
                headers: { Accept: "application/json" },
            });
            if (redirectToLoginIfUnauthorized(response)) return;
            if (!response.ok) return;
            const payload = await response.json();
            if (!applyBackendBillingData(payload)) return;
            delete document.body.dataset.billingDataSynced;
            setupBillingDataSync();
            document.querySelector("[data-notification-list]")?.removeAttribute("data-backend-notifications-rendered");
            document.querySelector("[data-audit-timeline]")?.removeAttribute("data-backend-audit-rendered");
            renderBackendProfile();
            renderBackendNotifications();
            renderBackendAuditEvents();
            window.HydroFlowRenderSupport?.();
            window.HydroFlowRenderChecklist?.();
            syncSidebarTodoCount();
            safeSyncSiteStatistics();
            setupResidentialHierarchy();
            window.HydroFlowApplyFilters?.(readFilterState(), { resetPage: false });
            const fingerprint = serverListFingerprint(payload);
            if (fingerprint !== lastServerListFingerprint) {
                lastServerListFingerprint = fingerprint;
                window.HydroFlowServerLists?.refreshAll?.();
            }
            document.dispatchEvent(new CustomEvent("hydroflow:backend-refreshed"));
        } catch {
            // The UI keeps the last successful payload when the local backend is temporarily unavailable.
        } finally {
            document.body.dataset.backendRefreshRunning = "false";
        }
    };
    // The snapshot is large and slow to build, so the page polls a short version code and downloads
    // the snapshot only when it changed (or at the latest every 5 minutes, as a safety net).
    const FULL_REFRESH_EVERY_MS = 5 * 60 * 1000;
    let lastFullRefreshAt = Date.now();
    document.addEventListener("hydroflow:backend-refreshed", () => {
        lastFullRefreshAt = Date.now();
    });
    const backendDataChanged = async () => {
        if (Date.now() - lastFullRefreshAt >= FULL_REFRESH_EVERY_MS) return true;
        try {
            const response = await fetch("/api/portal-data/version/", {
                cache: "no-store",
                credentials: "same-origin",
                headers: { Accept: "application/json" },
            });
            if (redirectToLoginIfUnauthorized(response)) return false;
            if (!response.ok) return true;
            const payload = await response.json().catch(() => ({}));
            return !payload.version || payload.version !== billingData.dataVersion;
        } catch {
            return false;
        }
    };
    const refreshBackendDataIfActive = async () => {
        if (!liveStatsEnabledForCurrentPage()) return;
        if (document.hidden) return;
        if (typeof document.hasFocus === "function" && !document.hasFocus()) return;
        if (!claimLiveStatsLock()) return;
        if (await backendDataChanged()) refreshBackendData();
    };
    if (!document.body.dataset.liveStatsTimer && liveStatsEnabledForCurrentPage()) {
        document.body.dataset.liveStatsTimer = "true";
        window.setInterval(() => {
            refreshBackendDataIfActive();
        }, 15000);
        window.addEventListener("focus", () => window.setTimeout(refreshBackendDataIfActive, 0));
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                releaseLiveStatsLock();
                return;
            }
            refreshBackendDataIfActive();
        });
        window.addEventListener("beforeunload", releaseLiveStatsLock);
    }

    const loadOverlayServerList = (id) => {
        if (id === "notifications-drawer") {
            serverListControllers.alerts?.load?.();
            return;
        }
        if (id === "audit-drawer") {
            serverListControllers.audit?.load?.();
        }
    };

    const OVERLAY_CLOSE_DURATION = 360;

    const finalizeOverlayClose = (overlay) => {
        if (!overlay) return;
        if (overlay.__closeTimer) {
            window.clearTimeout(overlay.__closeTimer);
            overlay.__closeTimer = null;
        }
        overlay.classList.add("hidden");
        overlay.classList.remove("is-open", "is-closing", "flex");
        if (overlay.classList.contains("app-drawer")) {
            overlay.classList.add("translate-x-full");
            overlay.style.transform = "";
            overlay.style.display = "";
            overlay.style.visibility = "";
            overlay.style.pointerEvents = "";
        }
        overlay.setAttribute("aria-hidden", "true");
        delete overlay.dataset.closing;
    };

    const cancelOverlayClosingState = (overlay) => {
        if (!overlay) return;
        if (overlay.__closeTimer) {
            window.clearTimeout(overlay.__closeTimer);
            overlay.__closeTimer = null;
        }
        overlay.classList.remove("is-closing");
        delete overlay.dataset.closing;
    };

    const syncOverlayBackdropVisibility = () => {
        const backdrop = document.querySelector("[data-overlay-backdrop]");
        const hasVisibleOverlay = document.querySelector(".app-drawer.is-open, .app-modal.is-open");
        if (hasVisibleOverlay) {
            backdrop?.classList.remove("hidden");
            window.requestAnimationFrame(() => backdrop?.classList.add("is-visible"));
            return;
        }
        backdrop?.classList.remove("is-visible");
        window.setTimeout(() => {
            const stillVisible = document.querySelector(".app-drawer.is-open, .app-modal.is-open");
            if (!stillVisible) backdrop?.classList.add("hidden");
        }, 90);
    };

    // One sound per opening: callers pass their own instead of playing a second one on top,
    // overlapping tones were heard as a stutter.
    const openOverlayById = (id, { sound = "modal-open" } = {}) => {
        const overlay = document.getElementById(id);
        if (!overlay) return;
        // Already open (or opening): a second call must not close and reopen it, which made the
        // window jump and its opening sound play twice.
        if (overlay.getAttribute("aria-hidden") === "false" && overlay.dataset.closing !== "true" && !overlay.classList.contains("hidden")) {
            return;
        }
        playSound(sound);
        document.querySelectorAll(".app-drawer.is-open").forEach((drawer) => {
            finalizeOverlayClose(drawer);
        });
        document.querySelectorAll(".app-modal.is-open").forEach((modal) => {
            finalizeOverlayClose(modal);
        });
        cancelOverlayClosingState(overlay);
        overlay.classList.remove("hidden");
        if (overlay.classList.contains("app-drawer")) {
            overlay.classList.remove("translate-x-full");
            overlay.style.display = "block";
            overlay.style.visibility = "visible";
            overlay.style.pointerEvents = "auto";
        } else {
            overlay.classList.add("flex");
        }
        overlay.setAttribute("aria-hidden", "false");
        window.requestAnimationFrame(() => {
            overlay.classList.add("is-open");
            if (overlay.classList.contains("app-drawer")) {
                overlay.style.transform = "translateX(0)";
            }
            syncOverlayBackdropVisibility();
        });
        loadOverlayServerList(id);
    };

    const closeOverlayById = (id) => {
        const overlay = document.getElementById(id);
        if (!overlay) return;
        if (overlay.dataset.closing === "true") return;
        overlay.dataset.closing = "true";
        overlay.classList.remove("is-open");
        overlay.classList.add("is-closing");
        overlay.setAttribute("aria-hidden", "true");
        overlay.__closeTimer = window.setTimeout(() => {
            finalizeOverlayClose(overlay);
            syncOverlayBackdropVisibility();
        }, OVERLAY_CLOSE_DURATION);
        syncOverlayBackdropVisibility();
    };

    const closeAllOverlays = () => {
        document.querySelectorAll(".app-drawer.is-open").forEach((overlay) => {
            if (overlay.id) closeOverlayById(overlay.id);
        });
        document.querySelectorAll(".app-modal.is-open").forEach((overlay) => {
            if (overlay.id) closeOverlayById(overlay.id);
        });
    };

    window.HydroFlowOpenOverlayById = openOverlayById;
    window.HydroFlowCloseOverlayById = closeOverlayById;
    window.HydroFlowCloseAllOverlays = closeAllOverlays;
    document.querySelector("[data-overlay-backdrop]")?.addEventListener("click", () => {
        closeAllOverlays();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAllOverlays();
            return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            openOverlayById("command-palette");
            window.setTimeout(() => document.querySelector("[data-command-input]")?.focus(), 0);
        }
    });
    document.querySelectorAll("[data-command-open]").forEach((input) => {
        input.closest("form")?.addEventListener("submit", (event) => event.preventDefault());
        input.addEventListener("focus", () => {
            openOverlayById("command-palette");
            window.setTimeout(() => document.querySelector("[data-command-input]")?.focus(), 0);
        });
    });

    const csrfToken = () => {
        const tokenInput = document.querySelector("input[name='csrfmiddlewaretoken']");
        if (tokenInput?.value) return tokenInput.value;
        return document.cookie
            .split(";")
            .map((part) => part.trim())
            .find((part) => part.startsWith("csrftoken="))
            ?.split("=")[1] || "";
    };

    const rehydrateFromPortalData = (portalData) => {
        if (!applyBackendBillingData(portalData)) return false;
        delete document.body.dataset.billingDataSynced;
        setupBillingDataSync();
        document.querySelector("[data-notification-list]")?.removeAttribute("data-backend-notifications-rendered");
        document.querySelector("[data-audit-timeline]")?.removeAttribute("data-backend-audit-rendered");
        renderBackendProfile();
        renderBackendNotifications();
        renderBackendAuditEvents();
        window.HydroFlowRenderSupport?.();
        window.HydroFlowRenderChecklist?.();
        safeSyncSiteStatistics();
        setupResidentialHierarchy();
        window.HydroFlowApplyFilters?.(readFilterState(), { resetPage: false });
        window.HydroFlowSyncLocale?.();
        document.dispatchEvent(new CustomEvent("hydroflow:backend-refreshed"));
        return true;
    };

    const postPortalJson = async (url, payload) => {
        const response = await fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken(),
            },
            body: JSON.stringify(payload),
        });
        if (redirectToLoginIfUnauthorized(response)) throw new Error("Authentication required");
        const raw = await response.text();
        let data = {};
        try {
            data = raw ? JSON.parse(raw) : {};
        } catch (error) {
            data = {};
        }
        if (!response.ok || data.ok === false) {
            console.error("Portal API request failed", {
                url,
                status: response.status,
                payload,
                response: data.error || raw.slice(0, 600),
            });
            throw new Error(data.error || `Request failed (${response.status})`);
        }
        return data;
    };

    const refreshPortalDataSnapshot = async () => {
        const response = await fetch("/api/portal-data/", {
            credentials: "same-origin",
            cache: "no-store",
            headers: { Accept: "application/json" },
        });
        if (redirectToLoginIfUnauthorized(response)) return false;
        if (!response.ok) return false;
        const portalData = await response.json().catch(() => null);
        return portalData ? rehydrateFromPortalData(portalData) : false;
    };

    const normalizeSystemAlertText = (value) => String(value || "").trim().toLowerCase();

    const findRecoveredSystemAlert = (requestPayload, previousIds = new Set()) => {
        const title = normalizeSystemAlertText(requestPayload.title);
        const message = normalizeSystemAlertText(requestPayload.message);
        if (!title) return null;
        return (Array.isArray(billingData.systemAlerts) ? billingData.systemAlerts : []).find((alert) => {
            const backendId = String(alert.backendId || "");
            if (backendId && previousIds.has(backendId)) return false;
            const sameTitle = normalizeSystemAlertText(alert.title) === title;
            const sameMessage = !message || normalizeSystemAlertText(alert.message || alert.subtitle) === message;
            return sameTitle && sameMessage;
        }) || null;
    };

    const setupResidentCreateForm = () => {
        const form = document.querySelector("[data-resident-create-form]");
        if (!form || form.dataset.residentCreateReady === "true") return;
        form.dataset.residentCreateReady = "true";
        const complexSelect = form.querySelector("[data-resident-create-complex]");
        const buildingSelect = form.querySelector("[data-resident-create-building]");
        const apartmentSelect = form.querySelector("[data-resident-create-apartment]");
        const status = form.querySelector("[data-resident-create-status]");
        const submit = form.querySelector("[data-resident-create-submit]");

        const setStatus = (message, kind = "info") => {
            if (!status) return;
            status.textContent = message;
            status.classList.remove("hidden", "is-error", "is-success");
            if (kind === "error") status.classList.add("is-error");
            if (kind === "success") status.classList.add("is-success");
        };

        const allFreeApartments = () => billingData.complexes.flatMap((complex) => (
            (complex.buildingItems || []).flatMap((building) => (
                (building.apartments || [])
                    .filter((apartment) => !apartment.isOccupied && apartment.apartmentBackendId)
                    .map((apartment) => ({
                        complexId: complex.id,
                        complexBackendId: complex.backendId || apartment.complexBackendId,
                        complexName: complex.name,
                        buildingId: building.id,
                        buildingBackendId: building.backendId || apartment.buildingBackendId,
                        buildingName: building.name,
                        apartmentBackendId: apartment.apartmentBackendId,
                        unit: apartment.unit,
                        label: `${complex.name} / ${building.name} / Apt. ${apartment.unit}`,
                    }))
            ))
        ));

        const fillSelect = (select, rows, getValue, getLabel, emptyLabel) => {
            if (!select) return;
            select.innerHTML = "";
            if (!rows.length) {
                select.innerHTML = `<option value="">${emptyLabel}</option>`;
                select.disabled = true;
                return;
            }
            select.disabled = false;
            rows.forEach((row) => {
                const option = document.createElement("option");
                option.value = getValue(row);
                option.textContent = getLabel(row);
                select.appendChild(option);
            });
        };

        const uniqueBy = (rows, key) => {
            const seen = new Set();
            return rows.filter((row) => {
                const value = row[key];
                if (seen.has(value)) return false;
                seen.add(value);
                return true;
            });
        };

        const syncOptions = () => {
            const free = allFreeApartments();
            const selectedComplex = complexSelect?.value || "";
            const selectedBuilding = buildingSelect?.value || "";

            fillSelect(
                complexSelect,
                uniqueBy(free, "complexBackendId"),
                (row) => row.complexBackendId,
                (row) => row.complexName,
                "No free apartments",
            );
            if (selectedComplex && Array.from(complexSelect.options).some((option) => option.value === selectedComplex)) {
                complexSelect.value = selectedComplex;
            }

            const complexRows = free.filter((row) => String(row.complexBackendId) === String(complexSelect?.value || ""));
            fillSelect(
                buildingSelect,
                uniqueBy(complexRows, "buildingBackendId"),
                (row) => row.buildingBackendId,
                (row) => row.buildingName,
                "No buildings",
            );
            if (selectedBuilding && Array.from(buildingSelect.options).some((option) => option.value === selectedBuilding)) {
                buildingSelect.value = selectedBuilding;
            }

            const buildingRows = complexRows.filter((row) => String(row.buildingBackendId) === String(buildingSelect?.value || ""));
            fillSelect(
                apartmentSelect,
                buildingRows,
                (row) => row.apartmentBackendId,
                (row) => row.label,
                "No free apartments",
            );
        };

        [complexSelect, buildingSelect].forEach((select) => {
            select?.addEventListener("change", syncOptions);
        });
        document.addEventListener("hydroflow:backend-refreshed", syncOptions);
        syncOptions();

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!apartmentSelect?.value) {
                setStatus("Select a free apartment first.", "error");
                return;
            }
            const formData = new FormData(form);
            submit.disabled = true;
            setStatus("Creating resident in Django admin and database...");
            try {
                const payload = await postPortalJson("/api/residents/create/", {
                    fio: formData.get("fio"),
                    phone: formData.get("phone"),
                    apartment_id: formData.get("apartment_id"),
                    has_contract: formData.get("has_contract"),
                });
                rehydrateFromPortalData(payload.portalData);
                form.reset();
                syncOptions();
                setStatus("Resident created and synced with admin.", "success");
                toast("Resident created", "Django admin and portal data were updated.", "success");
                window.setTimeout(() => closeOverlayById("request-modal"), 500);
            } catch (error) {
                setStatus(error.message || "Could not create resident.", "error");
                toast("Resident was not created", error.message || "Check the selected apartment.", "warning");
            } finally {
                submit.disabled = false;
            }
        });
    };

    const setupBuildingCreateForm = () => {
        const form = document.querySelector("[data-building-create-form]");
        if (!form || form.dataset.structureReady === "true") return;
        form.dataset.structureReady = "true";
        const complexSelect = form.querySelector("[data-building-create-complex]");
        const status = form.querySelector("[data-building-create-status]");
        const submit = form.querySelector("[data-building-create-submit]");

        const setStatus = (message, kind = "info") => {
            if (!status) return;
            status.textContent = message;
            status.classList.remove("hidden", "is-error", "is-success");
            if (kind === "error") status.classList.add("is-error");
            if (kind === "success") status.classList.add("is-success");
        };

        const syncComplexOptions = () => {
            const previous = complexSelect?.value || "";
            const complexes = (Array.isArray(billingData.complexes) ? billingData.complexes : []).filter((item) => item?.backendId);
            if (!complexSelect) return;
            complexSelect.innerHTML = complexes.length
                ? complexes.map((complex) => `<option value="${escapeHtml(complex.backendId)}">${escapeHtml(complex.name)}</option>`).join("")
                : '<option value="">No complexes available</option>';
            complexSelect.disabled = !complexes.length;
            if (previous && complexes.some((item) => String(item.backendId) === String(previous))) {
                complexSelect.value = previous;
            }
        };

        document.addEventListener("hydroflow:backend-refreshed", syncComplexOptions);
        syncComplexOptions();

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!complexSelect?.value) {
                setStatus("Create a district first.", "error");
                return;
            }
            const formData = new FormData(form);
            submit.disabled = true;
            setStatus("Creating house in Django admin and database...");
            try {
                const payload = await postPortalJson("/api/buildings/create/", {
                    complex_id: formData.get("complex_id"),
                    number: formData.get("number"),
                    address: formData.get("address"),
                });
                rehydrateFromPortalData(payload.portalData);
                form.reset();
                syncComplexOptions();
                setStatus("House created and synced with admin.", "success");
                toast("House created", "Django admin and portal data were updated.", "success");
                window.setTimeout(() => closeOverlayById("create-building-modal"), 500);
            } catch (error) {
                setStatus(error.message || "Could not create house.", "error");
                toast("House was not created", error.message || "Check the selected district.", "warning");
            } finally {
                submit.disabled = false;
            }
        });
    };

    const setupApartmentCreateForm = () => {
        const form = document.querySelector("[data-apartment-create-form]");
        if (!form || form.dataset.structureReady === "true") return;
        form.dataset.structureReady = "true";
        const complexSelect = form.querySelector("[data-apartment-create-complex]");
        const buildingSelect = form.querySelector("[data-apartment-create-building]");
        const status = form.querySelector("[data-apartment-create-status]");
        const submit = form.querySelector("[data-apartment-create-submit]");

        const setStatus = (message, kind = "info") => {
            if (!status) return;
            status.textContent = message;
            status.classList.remove("hidden", "is-error", "is-success");
            if (kind === "error") status.classList.add("is-error");
            if (kind === "success") status.classList.add("is-success");
        };

        const allComplexes = () => (Array.isArray(billingData.complexes) ? billingData.complexes : []).filter((item) => item?.backendId);

        const syncBuildingOptions = () => {
            if (!buildingSelect) return;
            const complexes = allComplexes();
            const selectedComplexId = complexSelect?.value || "";
            const selectedComplex = complexes.find((item) => String(item.backendId) === String(selectedComplexId));
            const buildings = Array.isArray(selectedComplex?.buildingItems)
                ? selectedComplex.buildingItems.filter((item) => item?.backendId)
                : [];
            const previous = buildingSelect.value || "";
            buildingSelect.innerHTML = buildings.length
                ? buildings.map((building) => `<option value="${escapeHtml(building.backendId)}">${escapeHtml(building.name || building.number || "House")}</option>`).join("")
                : '<option value="">No houses available</option>';
            buildingSelect.disabled = !buildings.length;
            if (previous && buildings.some((item) => String(item.backendId) === String(previous))) {
                buildingSelect.value = previous;
            }
        };

        const syncComplexOptions = () => {
            if (!complexSelect) return;
            const complexes = allComplexes();
            const previous = complexSelect.value || "";
            complexSelect.innerHTML = complexes.length
                ? complexes.map((complex) => `<option value="${escapeHtml(complex.backendId)}">${escapeHtml(complex.name)}</option>`).join("")
                : '<option value="">No complexes available</option>';
            complexSelect.disabled = !complexes.length;
            if (previous && complexes.some((item) => String(item.backendId) === String(previous))) {
                complexSelect.value = previous;
            }
            syncBuildingOptions();
        };

        complexSelect?.addEventListener("change", syncBuildingOptions);
        document.addEventListener("hydroflow:backend-refreshed", syncComplexOptions);
        syncComplexOptions();

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!buildingSelect?.value) {
                setStatus("Select a house first.", "error");
                return;
            }
            const formData = new FormData(form);
            submit.disabled = true;
            setStatus("Creating apartment in Django admin and database...");
            try {
                const payload = await postPortalJson("/api/apartments/create/", {
                    complex_id: formData.get("complex_id"),
                    building_id: formData.get("building_id"),
                    number: formData.get("number"),
                    area: formData.get("area"),
                });
                rehydrateFromPortalData(payload.portalData);
                form.reset();
                syncComplexOptions();
                setStatus("Apartment created and synced with admin.", "success");
                toast("Apartment created", "Django admin and portal data were updated.", "success");
                window.setTimeout(() => closeOverlayById("create-apartment-modal"), 500);
            } catch (error) {
                setStatus(error.message || "Could not create apartment.", "error");
                toast("Apartment was not created", error.message || "Check the selected structure.", "warning");
            } finally {
                submit.disabled = false;
            }
        });
    };

    const setupSystemAlertsConfig = () => {
        const modal = document.getElementById("system-alerts-config-modal");
        const form = modal?.querySelector("[data-system-alert-form]");
        if (!modal || !form || modal.dataset.alertsReady === "true") return;
        modal.dataset.alertsReady = "true";
        const complexInput = form.querySelector("input[name='complex_id']");
        const buildingSelect = form.querySelector("[data-system-alert-building]");
        const assigneeSelect = form.querySelector("[data-system-alert-assignee]");
        const submit = form.querySelector("[data-system-alert-submit]");
        const status = form.querySelector("[data-system-alert-status]");
        const list = modal.querySelector("[data-system-alert-list]");
        const count = modal.querySelector("[data-system-alert-count]");
        const currentLang = () => storage.getItem("hydroflow-lang") || "en";
        const t = (key) => translateValue(key, currentLang());
        const severityLabel = (value) => t(String(value || "info").toLowerCase());
        const statusLabel = (value) => t(String(value || "active").toLowerCase());
        const formatLiveCount = (value) => {
            const numeric = Number(value) || 0;
            if (currentLang() === "ru") return `${numeric} активных`;
            if (currentLang() === "uz") return `${numeric} ta faol`;
            return `${numeric} live`;
        };
        const syncModalStaticText = () => {
            if (count) {
                const numeric = count.dataset.count || count.textContent.match(/\d+/)?.[0] || "0";
                count.dataset.count = numeric;
                count.textContent = formatLiveCount(numeric);
            }
        };

        const setStatus = (message, type = "info") => {
            if (!status) return;
            status.classList.remove("hidden", "is-error", "is-success");
            status.classList.toggle("is-error", type === "error");
            status.classList.toggle("is-success", type === "success");
            const text = status.querySelector("p");
            if (text) text.textContent = t(message);
        };
        const allBuildings = () => billingData.complexes.flatMap((complex) => (
            Array.isArray(complex.buildingItems) ? complex.buildingItems.map((building) => ({ ...building, parentComplex: complex })) : []
        ));
        const syncBuildingOptions = () => {
            if (!buildingSelect) return;
            const buildings = allBuildings().filter((building) => building.backendId);
            const previous = buildingSelect.value;
            buildingSelect.innerHTML = [
                `<option value="">${escapeHtml(t("Whole complex"))}</option>`,
                ...buildings.map((building) => {
                    const complexLabel = building.parentComplex?.name ? ` (${building.parentComplex.name})` : "";
                    return `<option value="${escapeHtml(building.backendId || "")}">${escapeHtml((building.name || building.number || "Building") + complexLabel)}</option>`;
                }),
            ].join("");
            buildingSelect.value = previous && buildings.some((building) => String(building.backendId) === String(previous))
                ? previous
                : "";
            const selected = buildings.find((building) => String(building.backendId) === String(buildingSelect.value));
            if (complexInput) complexInput.value = selected?.parentComplex?.backendId || "";
        };
        // Every active portal account, the administrator included; the creator may assign themselves.
        const operators = () => (Array.isArray(billingData.operators) ? billingData.operators : [])
            .filter((user) => user.id);
        const myId = () => String(billingData.profile?.id || "");
        const assigneeHint = form.querySelector("[data-system-alert-assignee-hint]");
        const syncAssigneeHint = () => {
            if (!assigneeHint || !assigneeSelect) return;
            const chosen = operators().find((user) => String(user.id) === assigneeSelect.value);
            assigneeHint.textContent = chosen
                ? t(chosen.telegramConnected ? "Also sent to their Telegram." : "Their Telegram is not connected: the alert is shown in the portal only.")
                : "";
            assigneeHint.classList.toggle("is-warning", Boolean(chosen && !chosen.telegramConnected));
        };
        const syncAssigneeOptions = () => {
            if (!assigneeSelect) return;
            const people = operators();
            const previous = assigneeSelect.value;
            assigneeSelect.innerHTML = people.length
                ? people.map((user) => {
                    const name = String(user.name || user.username || "");
                    const label = `${name}${String(user.id) === myId() ? ` (${t("you")})` : ""}${user.telegramConnected ? "" : ` · ${t("without Telegram")}`}`;
                    return `<option value="${escapeAttr(user.id)}">${escapeHtml(label)}</option>`;
                }).join("")
                : `<option value="">${escapeHtml(t("No operators found"))}</option>`;
            assigneeSelect.disabled = !people.length;
            const keep = previous && people.some((user) => String(user.id) === previous);
            assigneeSelect.value = keep ? previous : (people.some((user) => String(user.id) === myId()) ? myId() : String(people[0]?.id || ""));
            syncAssigneeHint();
        };
        assigneeSelect?.addEventListener("change", syncAssigneeHint);
        const chipClass = (severity) => severity === "critical" ? "is-critical" : severity === "warning" ? "is-warning" : "is-info";
        const renderAlerts = () => {
            if (!list) return;
            const alerts = (Array.isArray(billingData.systemAlerts) ? billingData.systemAlerts : [])
                .filter((alert) => !["resolved", "archived"].includes(String(alert.status || "").toLowerCase()))
                .sort((a, b) => dateValue(b.detectedAt) - dateValue(a.detectedAt));
            if (count) {
                count.dataset.count = String(alerts.length);
                count.textContent = formatLiveCount(alerts.length);
            }
            list.innerHTML = alerts.length ? alerts.map((alert) => `
                <article class="system-alert-card" data-severity="${escapeHtml(alert.severity || "info")}">
                    <div class="system-alert-card-head">
                        <div class="system-alert-card-title">${escapeHtml(alert.title || t("System alert"))}</div>
                        <span class="system-alert-chip ${chipClass(alert.severity || "info")}">${escapeHtml(severityLabel(alert.severity || "info"))}</span>
                    </div>
                    <p class="system-alert-card-copy">${escapeHtml(alert.message || alert.subtitle || "")}</p>
                    <div class="system-alert-card-meta">
                        <span>${escapeHtml(alert.meta || alert.assignedTo || t("Operations Team"))}</span>
                        <span>•</span>
                        <span>${escapeHtml(alert.detectedAt || "")}</span>
                    </div>
                    <div class="system-alert-card-actions">
                        <span class="system-alert-chip is-status">${escapeHtml(statusLabel(alert.status || "active"))}</span>
                        ${!alert.assigneeId || String(alert.assigneeId) === myId()
                            ? `<button data-system-alert-action="resolve" data-system-alert-id="${escapeHtml(alert.backendId || "")}" type="button">${escapeHtml(t("Resolve"))}</button>`
                            : ""}
                    </div>
                </article>
            `).join("") : `<div class="system-alert-empty">${escapeHtml(t("No active alerts. Create one from this panel."))}</div>`;
            syncModalStaticText();
        };
        const prepare = () => {
            syncBuildingOptions();
            syncAssigneeOptions();
            renderAlerts();
        };

        buildingSelect?.addEventListener("change", syncBuildingOptions);
        document.querySelectorAll("[data-modal-open='system-alerts-config-modal']").forEach((button) => {
            button.addEventListener("click", prepare);
        });
        document.addEventListener("hydroflow:backend-refreshed", () => {
            syncBuildingOptions();
            syncAssigneeOptions();
            renderAlerts();
        });
        document.addEventListener("hydroflow:language-changed", () => {
            syncBuildingOptions();
            syncAssigneeOptions();
            renderAlerts();
            syncModalStaticText();
        });
        prepare();

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const previousAlertIds = new Set((Array.isArray(billingData.systemAlerts) ? billingData.systemAlerts : [])
                .map((alert) => String(alert.backendId || ""))
                .filter(Boolean));
            const requestPayload = {
                mode: "create",
                title: formData.get("title"),
                severity: formData.get("severity"),
                complex_id: formData.get("complex_id") || "",
                building_id: formData.get("building_id") || "",
                assignee_id: formData.get("assignee_id") || "",
                message: formData.get("message"),
            };
            submit.disabled = true;
            setStatus("Creating system alert in Django admin and database...");
            try {
                const payload = await postPortalJson("/api/system-alerts/configure/", requestPayload);
                if (payload.portalData) {
                    rehydrateFromPortalData(payload.portalData);
                } else {
                    await refreshPortalDataSnapshot();
                    if (payload.warning) console.warn(payload.warning);
                }
                renderAlerts();
                setStatus("System alert created and synced.", "success");
                form.reset();
                syncBuildingOptions();
                syncAssigneeOptions();
                // Where the alert reached the assignee: Telegram, or the portal only.
                const delivery = {
                    sent: ["Alert sent to Telegram", "success"],
                    not_linked: ["The operator has no Telegram: the alert is in the portal only.", "warning"],
                    failed: ["Telegram did not deliver the alert; it is in the portal.", "warning"],
                }[payload.telegramStatus] || ["The alert is now stored in Django admin and visible in the portal.", "success"];
                toast("System alert created", delivery[0], delivery[1]);
            } catch (error) {
                const recovered = await refreshPortalDataSnapshot().then(() => findRecoveredSystemAlert(requestPayload, previousAlertIds)).catch(() => null);
                if (recovered) {
                    renderAlerts();
                    setStatus("System alert created and synced.", "success");
                    form.reset();
                    syncBuildingOptions();
                    syncAssigneeOptions();
                    toast("System alert created", "The alert was saved in Django admin and recovered after refresh.", "success");
                    return;
                }
                setStatus(error.message || "Could not create system alert.", "error");
                toast("System alert not created", error.message || "Check the selected data.", "warning");
            } finally {
                submit.disabled = false;
            }
        });

        list?.addEventListener("click", async (event) => {
            const button = event.target.closest("[data-system-alert-action]");
            if (!button) return;
            const mode = button.dataset.systemAlertAction;
            const alertId = button.dataset.systemAlertId;
            if (!mode || !alertId) return;
            const original = button.textContent;
            button.disabled = true;
            button.textContent = mode === "resolve" ? t("Resolving...") : t("Updating...");
            try {
                const payload = await postPortalJson("/api/system-alerts/configure/", {
                    mode,
                    alert_id: alertId,
                });
                if (payload.portalData) {
                    rehydrateFromPortalData(payload.portalData);
                } else {
                    await refreshPortalDataSnapshot();
                    if (payload.warning) console.warn(payload.warning);
                }
                renderAlerts();
                const successKey = mode === "resolve"
                    ? "System alert resolved and synced."
                    : "System alert acknowledged and synced.";
                const toastBodyKey = mode === "resolve"
                    ? "The alert was resolved in Django admin and portal data."
                    : "The alert was acknowledged in Django admin and portal data.";
                setStatus(successKey, "success");
                toast("System alert updated", toastBodyKey, "success");
            } catch (error) {
                setStatus(error.message || "Could not update system alert.", "error");
                toast("System alert not updated", error.message || "Check backend data.", "warning");
            } finally {
                button.disabled = false;
                button.textContent = mode === "resolve" ? t("Resolve") : t("Acknowledge");
            }
        });
    };

    // The payment notice window. It is about one debtor at a time: the operator finds them with the
    // search (a dropdown of debtors only: ID, name, house, apartment, debt) or the window is opened
    // for a resident (their profile, "Send reminder"). The left column shows that debtor and the
    // right one the notice the server builds for them; the panel keeps its size whatever is typed.
    const setupBillingNoticeQuickAction = () => {
        const modal = document.getElementById("billing-notice-modal");
        if (!modal || modal.dataset.ready === "true") return;
        modal.dataset.ready = "true";
        const langButtons = Array.from(modal.querySelectorAll("[data-billing-notice-lang]"));
        const searchBox = modal.querySelector("[data-billing-notice-search-box]");
        const searchInput = modal.querySelector("[data-billing-notice-search]");
        const searchClear = modal.querySelector("[data-billing-notice-search-clear]");
        const resultsNode = modal.querySelector("[data-billing-notice-results]");
        const sortButton = modal.querySelector("[data-billing-notice-sort]");
        const sortLabel = modal.querySelector("[data-billing-notice-sort-label]");
        const countNode = modal.querySelector("[data-billing-notice-count]");
        const selectedNode = modal.querySelector("[data-billing-notice-selected]");
        const debtorsNode = modal.querySelector("[data-billing-notice-debtors]");
        const pdfButton = modal.querySelector("[data-billing-notice-pdf]");
        const telegramButton = modal.querySelector("[data-billing-notice-telegram]");
        let activeLang = "uz";
        let activeSort = "desc";
        let activeResidentId = "";
        let noticeResidents = [];
        let loading = false;
        let resultRows = [];
        let highlighted = -1;

        const debtValue = (resident) => {
            const value = Number(resident?.balance ?? 0);
            return Number.isFinite(value) ? Math.abs(Math.min(value, 0)) : 0;
        };
        const searchNoticeText = (...values) => values
            .filter((value) => value !== null && value !== undefined)
            .map((value) => String(value))
            .join(" ")
            .toLowerCase();

        const assignNoticeResidents = (rows) => {
            noticeResidents = Array.isArray(rows) ? rows.filter(Boolean).slice() : [];
        };

        const hydrateNoticeResidentsFromState = () => {
            if (Array.isArray(window.HydroFlowBackendData?.residents) && window.HydroFlowBackendData.residents.length) {
                assignNoticeResidents(window.HydroFlowBackendData.residents);
                return;
            }
            if (Array.isArray(billingData.residents) && billingData.residents.length) {
                assignNoticeResidents(billingData.residents);
                return;
            }
            assignNoticeResidents([]);
        };

        const noticeResidentId = (resident) => String(resident?.ownerBackendId || "").replace(/[^\d]/g, "");

        // Only debtors get a notice: a vacant apartment has nobody to notify, and a resident at zero
        // or in credit owes nothing.
        const getNoticeResidents = () => noticeResidents.filter((resident) => (
            Boolean(resident?.ownerBackendId) && debtValue(resident) > 0
        ));

        const refreshBillingNoticeData = async () => {
            try {
                const response = await fetch("/api/portal-data/", {
                    credentials: "same-origin",
                    headers: { Accept: "application/json" },
                });
                if (redirectToLoginIfUnauthorized(response)) return null;
                if (!response.ok) throw new Error(`Request failed (${response.status})`);
                const payload = await response.json();
                applyBackendBillingData(payload);
                assignNoticeResidents(payload?.residents);
                window.HydroFlowBackendData = payload;
                return payload;
            } catch (error) {
                console.warn("Billing notice backend refresh failed", error);
                return null;
            }
        };

        const sortNoticeResidents = (rows) => {
            const direction = activeSort === "asc" ? 1 : -1;
            return rows.slice().sort((a, b) => (
                direction * (debtValue(a) - debtValue(b)) || String(a.name || "").localeCompare(String(b.name || ""))
            ));
        };

        // A query is a phone (3+ digits, any formatting: "90 205", "+998-90") or words that each
        // match the name, the house (from its start: "64" finds 64A), the apartment (exactly: "64A 2"
        // is apartment 2 of house 64A) or the Telegram username. Names are stored in Latin, but
        // operators often type in Cyrillic ("Мух" for Muhammad) or with the other spelling, so both
        // sides are compared as a loose Latin key: Cyrillic transliterated, apostrophes dropped, and
        // letters Russian and Uzbek spell differently merged (х/ҳ/x → h, қ/q → k).
        const cyrillicToLatin = {
            а: "a", б: "b", в: "v", г: "g", ғ: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i",
            й: "y", к: "k", қ: "k", л: "l", м: "m", н: "n", о: "o", ў: "o", п: "p", р: "r", с: "s",
            т: "t", у: "u", ф: "f", х: "h", ҳ: "h", ц: "s", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i",
            ь: "", э: "e", ю: "yu", я: "ya",
        };
        const looseSearchKey = (value) => searchNoticeText(value)
            .replace(/[ʻʼ'`’‘]/g, "")
            // Uzbek spelling: "е" at the start of a word or after a vowel is "ye" (Яхёев = Yaxyoyev).
            .replace(/(^|[\s\-аеёиоуўэюяъь])е/g, "$1ye")
            .replace(/[Ѐ-ӿ]/g, (char) => cyrillicToLatin[char] ?? char)
            .replace(/x/g, "h")
            .replace(/q/g, "k");
        const residentMatchesWord = (resident, word) => {
            const key = looseSearchKey(word);
            return looseSearchKey(resident.name).includes(key)
                || looseSearchKey(resident.building).startsWith(key)
                || looseSearchKey(resident.apartment) === key
                || looseSearchKey(resident.complex).includes(key)
                || looseSearchKey(resident.telegramUser).replace(/^@/, "").includes(key.replace(/^@/, ""));
        };
        const matchingDebtors = () => {
            const query = searchNoticeText(searchInput?.value || "").trim();
            const words = query.split(/\s+/).filter(Boolean);
            const phoneDigits = /^[\d\s+()-]+$/.test(query) ? query.replace(/\D/g, "") : "";
            return sortNoticeResidents(getNoticeResidents().filter((resident) => {
                if (phoneDigits.length >= 3 && String(resident.phone || "").replace(/\D/g, "").includes(phoneDigits)) return true;
                if (phoneDigits.length >= 3 && String(resident.personalAccount || "").includes(phoneDigits)) return true;
                return words.every((word) => residentMatchesWord(resident, word));
            }));
        };

        const selectedResident = () => getNoticeResidents()
            .find((resident) => noticeResidentId(resident) === activeResidentId) || null;

        // Left column: the chosen debtor, or how to choose one.
        const renderSelected = (resident) => {
            if (!selectedNode) return;
            if (!resident) {
                selectedNode.innerHTML = `
                    <div class="billing-notice-selected-empty">
                        <span class="material-symbols-outlined" aria-hidden="true">${loading ? "hourglass_top" : "person_search"}</span>
                        <p>${escapeHtml(t(loading ? "Loading residents..." : "Choose a debtor"))}</p>
                        ${loading ? "" : `<small>${escapeHtml(t("Search by name, house, apartment, phone or personal account, then pick the debtor."))}</small>`}
                    </div>
                `;
                return;
            }
            selectedNode.innerHTML = `
                <div class="billing-notice-selected-card">
                    <div class="min-w-0">
                        <p class="text-sm font-black text-on-surface">${escapeHtml(resident.name || "-")}</p>
                        <p class="text-xs text-on-surface-variant mt-1">${escapeHtml([resident.building, resident.apartment].filter(Boolean).join(" • ") || "-")}</p>
                        ${resident.personalAccount ? `<p class="text-xs text-on-surface-variant mt-1">${escapeHtml(`${t("Personal account")}: ${resident.personalAccount}`)}</p>` : ""}
                        <p class="text-xs text-on-surface-variant mt-2">${escapeHtml(resident.phone || "-")}</p>
                        ${resident.telegramConnected ? `<p class="text-[11px] font-bold text-primary mt-1">${escapeHtml(t("Telegram connected"))}</p>` : ""}
                    </div>
                    <div class="shrink-0 text-right">
                        <p class="text-sm font-black text-error">${escapeHtml(formatBillingUzs(debtValue(resident)))}</p>
                        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant mt-1">${escapeHtml(resident.lastPayment || "-")}</p>
                    </div>
                </div>
            `;
        };

        // Under the chosen debtor: every debtor in the balance order (largest debt first by default);
        // a row picks that debtor, and the chosen one is marked.
        const renderDebtors = () => {
            if (!debtorsNode) return;
            if (loading) {
                debtorsNode.innerHTML = "";
                return;
            }
            const debtors = sortNoticeResidents(getNoticeResidents());
            debtorsNode.innerHTML = debtors.length
                ? debtors.map((resident) => {
                    const residentId = noticeResidentId(resident);
                    const unit = [resident.building, resident.apartment].filter(Boolean).join(" · ") || "-";
                    return `
                        <button class="billing-notice-debtor ${residentId === activeResidentId ? "is-selected" : ""}" data-billing-notice-debtor="${escapeAttr(residentId)}" title="${escapeAttr(resident.name || "")}" type="button">
                            <span class="billing-notice-debtor-unit">${escapeHtml(unit)}</span>
                            <span class="billing-notice-debtor-name">${escapeHtml(resident.name || "-")}</span>
                            <span class="billing-notice-debtor-debt">${escapeHtml(formatBillingUzs(debtValue(resident)))}</span>
                        </button>
                    `;
                }).join("")
                : `<p class="billing-notice-debtors-empty">${escapeHtml(t("No debtors"))}</p>`;
        };

        // The search dropdown: debtors only, best match first; Enter or a click picks one.
        const resultsOpen = () => Boolean(resultsNode && !resultsNode.classList.contains("hidden"));
        const closeResults = () => {
            resultsNode?.classList.add("hidden");
            searchInput?.setAttribute("aria-expanded", "false");
            highlighted = -1;
        };
        const renderResults = () => {
            if (!resultsNode) return;
            if (!(searchInput?.value || "").trim()) {
                resultRows = [];
                closeResults();
                return;
            }
            resultRows = matchingDebtors();
            highlighted = resultRows.length ? Math.min(Math.max(highlighted, 0), resultRows.length - 1) : -1;
            resultsNode.innerHTML = resultRows.length
                ? resultRows.map((resident, index) => {
                    const residentId = noticeResidentId(resident);
                    return `
                        <button aria-selected="${index === highlighted}" class="billing-notice-result ${index === highlighted ? "is-active" : ""}" data-billing-notice-result="${escapeAttr(residentId)}" role="option" tabindex="-1" type="button">
                            <span class="billing-notice-result-icon material-symbols-outlined" aria-hidden="true">person</span>
                            <span class="billing-notice-result-copy">
                                <strong>${escapeHtml(resident.name || "-")}</strong>
                                <small>ID ${escapeHtml(residentId)} · ${escapeHtml(t("House"))} ${escapeHtml(resident.building || "-")} · ${escapeHtml(t("Apartment"))} ${escapeHtml(resident.apartment || "-")}${resident.personalAccount ? ` · ${escapeHtml(t("Personal account"))} ${escapeHtml(resident.personalAccount)}` : ""}</small>
                            </span>
                            <span class="billing-notice-result-debt">${escapeHtml(formatBillingUzs(debtValue(resident)))}</span>
                        </button>
                    `;
                }).join("")
                : `<div class="billing-notice-result-empty">${escapeHtml(t("No debtor found"))}</div>`;
            resultsNode.classList.remove("hidden");
            searchInput?.setAttribute("aria-expanded", "true");
            resultsNode.querySelector(".billing-notice-result.is-active")?.scrollIntoView({ block: "nearest" });
        };

        // The notice comes from the server (/api/billing-notice/preview/). The PDF and the Telegram
        // message are built from the same data, so what the operator reads here is what is sent.
        const noticeCache = new Map();
        let noticeRequestId = 0;
        const noticeDocument = modal.querySelector("[data-billing-notice-document]");
        const setNoticeText = (selector, value) => {
            const node = modal.querySelector(selector);
            if (node) node.textContent = value || "";
        };
        const noticeFieldMarkup = (item) => `
            <p><span class="font-black">${escapeHtml(item.label)}:</span> <span class="${item.key === "debt" ? "text-error font-black" : ""}">${escapeHtml(item.value)}</span></p>
        `;
        const renderNoticeDocument = (notice) => {
            setNoticeText("[data-billing-notice-doc-title]", notice?.title);
            setNoticeText("[data-billing-notice-company]", notice?.company);
            setNoticeText("[data-billing-notice-preview-balance]", notice?.amount);
            setNoticeText("[data-billing-notice-generated-at]", notice?.date);
            if (!noticeDocument) return;
            if (!notice) {
                noticeDocument.innerHTML = `<p class="billing-notice-placeholder">${escapeHtml(t("The notice appears here once a debtor is chosen."))}</p>`;
                return;
            }
            noticeDocument.innerHTML = `
                <div class="text-center space-y-1">
                    <p class="text-[26px] font-black tracking-tight">${escapeHtml(notice.title)}</p>
                    <p class="text-base text-on-surface-variant">${escapeHtml(notice.subheading)}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[15px] leading-7">${notice.fields.map(noticeFieldMarkup).join("")}</div>
                <div class="space-y-4 text-[15px] leading-7">${notice.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 pt-4 text-[15px]">${notice.signatures.map(noticeFieldMarkup).join("")}</div>
            `;
        };
        const renderPreview = (resident) => {
            langButtons.forEach((button) => {
                const isActive = button.dataset.billingNoticeLang === activeLang;
                button.classList.toggle("bg-primary", isActive);
                button.classList.toggle("text-white", isActive);
                button.classList.toggle("text-on-surface-variant", !isActive);
            });
            const requestId = ++noticeRequestId;
            if (!resident) {
                renderNoticeDocument(null);
                return;
            }
            const key = `${noticeResidentId(resident)}:${activeLang}`;
            if (noticeCache.has(key)) {
                renderNoticeDocument(noticeCache.get(key));
                return;
            }
            if (noticeDocument) {
                noticeDocument.innerHTML = `<p class="text-sm font-bold text-on-surface-variant">${escapeHtml(t("Preparing notice..."))}</p>`;
            }
            const query = new URLSearchParams({ owner_id: noticeResidentId(resident), language: activeLang });
            fetch(`/api/billing-notice/preview/?${query}`, { credentials: "same-origin", headers: { Accept: "application/json" } })
                .then((response) => {
                    if (redirectToLoginIfUnauthorized(response)) throw new Error("Authentication required");
                    if (!response.ok) throw new Error(`Request failed (${response.status})`);
                    return response.json();
                })
                .then((payload) => {
                    noticeCache.set(key, payload.notice);
                    if (requestId === noticeRequestId) renderNoticeDocument(payload.notice);
                })
                .catch(() => {
                    if (requestId !== noticeRequestId || !noticeDocument) return;
                    noticeDocument.innerHTML = `<p class="text-sm font-bold text-error">${escapeHtml(t("Could not prepare the notice."))}</p>`;
                });
        };

        const syncFilters = () => {
            if (!sortButton || !sortLabel) return;
            sortLabel.textContent = activeSort === "asc" ? t("Smallest first") : t("Largest first");
        };

        const render = () => {
            const resident = selectedResident();
            renderSelected(resident);
            renderDebtors();
            renderPreview(resident);
            syncFilters();
            if (countNode) countNode.textContent = `${t("Debtors")}: ${getNoticeResidents().length}`;
            if (searchClear) searchClear.classList.toggle("hidden", !(searchInput?.value || "").trim());
            if (pdfButton) pdfButton.disabled = !resident;
            if (telegramButton) telegramButton.disabled = !resident;
            if (resultsOpen()) renderResults();
        };

        const chooseResident = (residentId) => {
            if (!residentId) return;
            activeResidentId = residentId;
            if (searchInput) searchInput.value = "";
            closeResults();
            render();
        };

        const openNoticeModal = (preferredResidentId = "") => {
            openOverlayById("billing-notice-modal");
            // A fresh window shows fresh balances.
            noticeCache.clear();
            activeSort = "desc";
            if (searchInput) searchInput.value = "";
            closeResults();
            activeResidentId = String(preferredResidentId || "").replace(/[^\d]/g, "");
            hydrateNoticeResidentsFromState();
            loading = !noticeResidents.length;
            render();
            // Opened without a debtor: the operator starts by searching for one.
            if (!activeResidentId) window.setTimeout(() => searchInput?.focus(), 200);
            refreshBillingNoticeData()
                .then(() => {
                    loading = false;
                    // Opened for a resident who owes nothing: say so instead of an empty window.
                    const preferred = activeResidentId && noticeResidents.find((resident) => noticeResidentId(resident) === activeResidentId);
                    if (preferred && debtValue(preferred) <= 0) {
                        toast("Billing notice", "The resident has no debt.", "warning");
                    }
                    render();
                })
                .catch((error) => {
                    loading = false;
                    console.error("Billing notice modal render failed", error);
                    toast("Billing notice", "Could not prepare debtor list.", "warning");
                });
        };
        window.HydroFlowOpenBillingNoticeForResident = (ownerBackendId) => {
            const normalized = String(ownerBackendId || "").replace(/[^\d]/g, "");
            openNoticeModal(normalized);
        };
        window.HydroFlowOpenBillingNotice = () => openNoticeModal();

        // One delegated listener opens the notice for every trigger; a per-button listener on top of
        // it opened the window twice per click.
        if (document.body.dataset.billingNoticeDelegated !== "true") {
            document.body.dataset.billingNoticeDelegated = "true";
            document.addEventListener("click", (event) => {
                const trigger = event.target.closest("[data-billing-notice-open]");
                if (!trigger) return;
                event.preventDefault();
                openNoticeModal();
            }, true);
        }

        langButtons.forEach((button) => {
            button.addEventListener("click", () => {
                activeLang = button.dataset.billingNoticeLang || "uz";
                render();
            });
        });

        sortButton?.addEventListener("click", () => {
            activeSort = activeSort === "desc" ? "asc" : "desc";
            render();
        });

        searchInput?.addEventListener("input", () => {
            highlighted = 0;
            renderResults();
            searchClear?.classList.toggle("hidden", !(searchInput.value || "").trim());
        });
        searchInput?.addEventListener("focus", () => renderResults());
        searchInput?.addEventListener("keydown", (event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                if (!resultRows.length) return;
                event.preventDefault();
                const step = event.key === "ArrowDown" ? 1 : -1;
                highlighted = (highlighted + step + resultRows.length) % resultRows.length;
                renderResults();
                return;
            }
            if (event.key === "Enter" && resultsOpen()) {
                event.preventDefault();
                chooseResident(noticeResidentId(resultRows[highlighted]));
                return;
            }
            // Escape closes the dropdown first; with it closed, Escape closes the window as usual.
            if (event.key === "Escape" && resultsOpen()) {
                event.preventDefault();
                event.stopPropagation();
                closeResults();
            }
        });
        debtorsNode?.addEventListener("click", (event) => {
            chooseResident(event.target.closest("[data-billing-notice-debtor]")?.dataset.billingNoticeDebtor || "");
        });
        // Keep the focus in the search while a result is clicked.
        resultsNode?.addEventListener("mousedown", (event) => event.preventDefault());
        resultsNode?.addEventListener("click", (event) => {
            chooseResident(event.target.closest("[data-billing-notice-result]")?.dataset.billingNoticeResult || "");
        });
        document.addEventListener("click", (event) => {
            if (resultsOpen() && !searchBox?.contains(event.target)) closeResults();
        });
        searchClear?.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            closeResults();
            render();
            searchInput?.focus();
        });

        pdfButton?.addEventListener("click", async () => {
            const resident = selectedResident();
            if (!resident) return;
            pdfButton.disabled = true;
            try {
                const payload = await postPortalJson("/api/billing-notice/pdf/", { owner_id: noticeResidentId(resident), language: activeLang });
                triggerDownloadPayload(payload.download);
                toast("Notice downloaded", "The payment notice was saved as PDF.", "success");
            } catch (error) {
                toast("Notice not created", error?.message || "Could not prepare the notice.", "warning");
            } finally {
                pdfButton.disabled = false;
            }
        });

        // The server sends the notice shown in the window, in the language chosen there.
        telegramButton?.addEventListener("click", async () => {
            const resident = selectedResident();
            if (!resident) return;
            if (!resident.telegramConnected) {
                toast("Not sent", "The resident is not connected to Telegram.", "warning");
                return;
            }
            telegramButton.disabled = true;
            try {
                await postPortalJson("/api/billing-notice/telegram/", { owner_id: noticeResidentId(resident), language: activeLang });
                toast("Sent to Telegram", "The debt notice was sent to the resident in Telegram.", "success");
            } catch (error) {
                toast("Not sent", error?.message || "Could not send the notice.", "warning");
            } finally {
                telegramButton.disabled = false;
            }
        });

        document.addEventListener("hydroflow:backend-refreshed", () => {
            if (!modal.classList.contains("hidden")) render();
        });
        document.addEventListener("hydroflow:language-changed", () => {
            if (!modal.classList.contains("hidden")) render();
        });
    };

    const setupBillingPeriodQuickAction = () => {};

    setupBuildingCreateForm();
    setupApartmentCreateForm();
    setupResidentCreateForm();
    setupSystemAlertsConfig();

    const nearestActionPayload = (trigger) => {
        const detailsHost = trigger.closest("#details-drawer");
        if (detailsHost) {
            return {
                owner_id: detailsHost.dataset.ownerBackendId || "",
                apartment_id: detailsHost.dataset.apartmentBackendId || "",
                building_id: detailsHost.dataset.buildingBackendId || "",
                complex_id: detailsHost.dataset.complexBackendId || "",
                alert_id: detailsHost.dataset.alertBackendId || "",
                notification_id: detailsHost.dataset.notificationBackendId || "",
                label: detailsHost.querySelector("#details-title")?.textContent?.trim() || "Details",
            };
        }
        const apartmentHost = trigger.closest("#apartment-details-drawer");
        if (apartmentHost) {
            return {
                owner_id: apartmentHost.dataset.ownerBackendId || "",
                apartment_id: apartmentHost.dataset.apartmentBackendId || "",
                building_id: apartmentHost.dataset.buildingBackendId || "",
                complex_id: apartmentHost.dataset.complexBackendId || "",
                label: apartmentHost.querySelector("[data-apartment-title]")?.textContent?.trim() || "Apartment",
            };
        }
        const residentCard = trigger.closest("[data-resident-card]");
        if (residentCard) {
            return {
                owner_id: residentCard.dataset.ownerBackendId || "",
                apartment_id: residentCard.dataset.apartmentBackendId || "",
                building_id: residentCard.dataset.buildingBackendId || "",
                complex_id: residentCard.dataset.complexBackendId || "",
                label: residentCard.querySelector("h4")?.textContent?.trim() || "Resident",
            };
        }
        const notificationItem = trigger.closest(".notification-item");
        if (notificationItem) {
            return {
                notification_id: notificationItem.dataset.notificationBackendId || "",
                label: notificationItem.querySelector(".text-sm.font-bold")?.textContent?.trim() || "Notification",
            };
        }
        return {};
    };

    document.addEventListener("click", async (event) => {
        const reminderButton = event.target.closest("[data-reminder-action]");
        if (!reminderButton) return;
        event.preventDefault();
        const payload = nearestActionPayload(reminderButton);
        if (payload.owner_id && window.HydroFlowOpenBillingNoticeForResident) {
            window.HydroFlowOpenBillingNoticeForResident(payload.owner_id);
            return;
        }
        try {
            const response = await postPortalJson("/api/reminders/send/", payload);
            rehydrateFromPortalData(response.portalData);
            toast("Reminder queued", `${response.count || 1} reminder(s) synced to backend.`, "success");
        } catch (error) {
            toast("Reminder failed", error.message || "Backend reminder sync failed.", "warning");
        }
    }, true);

    const setupResidentKitTools = () => {
        const modal = document.getElementById("resident-kit-modal");
        const content = modal?.querySelector("[data-resident-kit-content]");
        const subtitle = modal?.querySelector("[data-resident-kit-subtitle]");
        const note = modal?.querySelector("[data-resident-kit-note] p");
        const actionLabel = modal?.querySelector("[data-resident-kit-action-label]");
        const contentLabel = modal?.querySelector("[data-resident-kit-content-label]");
        const visibleCount = modal?.querySelector("[data-resident-kit-visible-count]");
        const debtorCount = modal?.querySelector("[data-resident-kit-debtor-count]");
        const copyButton = modal?.querySelector("[data-resident-kit-copy]");
        if (!modal || !content || modal.dataset.residentKitReady === "true") return;
        modal.dataset.residentKitReady = "true";

        let residentKitMode = "reminder_script";
        const currentLang = () => storage.getItem("hydroflow-lang") || "en";
        const t = (key) => translateValue(key, currentLang());
        const textSet = () => {
            const lang = currentLang();
            return {
                greeting: lang === "ru" ? "Сценарий напоминания для жильца" : lang === "uz" ? "Rezident uchun eslatma ssenariysi" : "Resident reminder script",
                opening: lang === "ru" ? "Здравствуйте. Напоминаем, что по вашему объекту зафиксирована задолженность." : lang === "uz" ? "Salom. Obyektingiz bo'yicha qarzdorlik mavjudligini eslatamiz." : "Hello. This is a reminder that your unit currently has an outstanding balance.",
                closing: lang === "ru" ? "Пожалуйста, подтвердите дату оплаты или свяжитесь с операционной командой." : lang === "uz" ? "Iltimos, to'lov sanasini tasdiqlang yoki operatsion jamoa bilan bog'laning." : "Please confirm your payment date or contact the operations team.",
                noDebtors: lang === "ru" ? "По текущим видимым жильцам должников нет. Скрипт не требуется." : lang === "uz" ? "Joriy ko'rinayotgan rezidentlar orasida qarzdor yo'q. Skript talab qilinmaydi." : "There are no debtor residents in the current visible set. No reminder script is required.",
                reminderNote: lang === "ru" ? "Скрипт собран по текущим должникам и их последним платежам." : lang === "uz" ? "Skript joriy qarzdorlar va ularning oxirgi to'lovlari bo'yicha tuzildi." : "Script is generated from current debtor residents and their latest payments.",
                contactNote: lang === "ru" ? "Файл включает текущих жильцов, квартиры, телефоны, статус и баланс." : lang === "uz" ? "Faylda joriy rezidentlar, xonadon, telefon, holat va balans bor." : "The file includes current residents, apartments, phone, status and balance.",
                phone: lang === "ru" ? "Телефон" : lang === "uz" ? "Telefon" : "Phone",
                name: lang === "ru" ? "Имя" : lang === "uz" ? "Ism" : "Name",
                apartment: lang === "ru" ? "Квартира" : lang === "uz" ? "Xonadon" : "Apartment",
                building: lang === "ru" ? "Дом" : lang === "uz" ? "Uy" : "Building",
                balance: lang === "ru" ? "Баланс" : lang === "uz" ? "Balans" : "Balance",
                lastPayment: lang === "ru" ? "Последний платёж" : lang === "uz" ? "Oxirgi to'lov" : "Last payment",
                status: lang === "ru" ? "Статус" : lang === "uz" ? "Holat" : "Status",
                debtor: lang === "ru" ? "Должник" : lang === "uz" ? "Qarzdor" : "Debtor",
                paid: lang === "ru" ? "Оплатил" : lang === "uz" ? "To'langan" : "Paid",
            };
        };
        const visibleResidentsInScope = () => {
            const cards = Array.from(document.querySelectorAll("[data-resident-grid] [data-resident-card]"))
                .filter((card) => !card.classList.contains("hidden") && card.dataset.globalFilterHidden !== "true");
            const rows = cards
                .map((card) => billingData.residents.find((resident) => resident.id === card.dataset.residentId))
                .filter(Boolean);
            return rows.length ? rows : (Array.isArray(billingData.residents) ? billingData.residents : []);
        };
        const visibleDebtorsInScope = (rows = visibleResidentsInScope()) => rows.filter((resident) => String(resident.status || "").toLowerCase() === "debtor");
        const buildReminderScript = (rows) => {
            const labels = textSet();
            if (!rows.length) return labels.noDebtors;
            return [
                labels.greeting,
                "",
                ...rows.map((resident, index) => [
                    `${index + 1}. ${resident.name}`,
                    `${labels.apartment}: ${resident.apartmentNumber || resident.apartment || "-"}`,
                    `${labels.phone}: ${resident.phone || "-"}`,
                    `${labels.balance}: ${formatBillingUzs(Math.abs(Number(resident.balance) || 0))}`,
                    `${labels.lastPayment}: ${resident.lastPayment || "-"}`,
                    labels.opening,
                    labels.closing,
                ].join("\n")),
            ].join("\n\n");
        };
        const buildContactSheetCsv = (rows) => {
            const labels = textSet();
            const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
            return [
                [labels.apartment, labels.building, labels.name, labels.phone, labels.status, labels.balance, labels.lastPayment].map(escapeCsv).join(","),
                ...rows.map((resident) => [
                    resident.apartmentNumber || resident.apartment || "",
                    resident.building || "",
                    resident.name || "",
                    resident.phone || "",
                    resident.status === "debtor" ? labels.debtor : labels.paid,
                    formatBillingUzs(Math.abs(Number(resident.balance) || 0)),
                    resident.lastPayment || "",
                ].map(escapeCsv).join(",")),
            ].join("\r\n");
        };
        const syncBackendAudit = async (action, extra = {}) => {
            const visibleResidents = visibleResidentsInScope();
            const debtors = visibleDebtorsInScope(visibleResidents);
            const ownerIds = visibleResidents.map((resident) => resident.ownerBackendId).filter(Boolean);
            const payload = await postPortalJson("/api/resident-kit/action/", {
                action,
                owner_ids: ownerIds,
                visible_count: visibleResidents.length,
                debtor_count: debtors.length,
                ...extra,
            });
            rehydrateFromPortalData(payload.portalData);
        };
        const syncReminderModal = () => {
            const residents = visibleResidentsInScope();
            const debtors = visibleDebtorsInScope(residents);
            const labels = textSet();
            residentKitMode = "reminder_script";
            if (actionLabel) actionLabel.textContent = t("Reminder script");
            if (contentLabel) contentLabel.textContent = t("Reminder script");
            if (subtitle) subtitle.textContent = t("Generated from current backend residents and balances.");
            if (note) note.textContent = labels.reminderNote;
            if (visibleCount) visibleCount.textContent = String(residents.length);
            if (debtorCount) debtorCount.textContent = String(debtors.length);
            content.value = buildReminderScript(debtors);
        };
        copyButton?.addEventListener("click", async () => {
            try {
                await navigator.clipboard?.writeText(content.value || "");
                toast(t("Reminder script copied"), t("Reminder script is ready for the current debtor residents."), "success");
            } catch {
                toast(t("Reminder script prepared"), content.value || "", "info");
            }
        });

        document.querySelectorAll("[data-resident-kit-action]").forEach((button) => button.addEventListener("click", async (event) => {
            event.preventDefault();
            const action = button.dataset.residentKitAction;
            if (!action) return;
            button.disabled = true;
            try {
                if (action === "move_in_checklist") {
                    await syncBackendAudit(action);
                    window.HydroFlowOpenChecklist?.(t("Move-in checklist"));
                    toast(t("Move-in checklist opened"), t("Checklist synced with backend audit log."), "info");
                    return;
                }
                if (action === "reminder_script") {
                    syncReminderModal();
                    openOverlayById("resident-kit-modal");
                    await syncBackendAudit(action);
                    toast(t("Reminder script prepared"), t("Reminder script is ready for the current debtor residents."), "success");
                    return;
                }
                if (action === "contact_sheet") {
                    const residents = visibleResidentsInScope();
                    const csvContent = buildContactSheetCsv(residents);
                    downloadBlob(csvContent, "text/csv;charset=utf-8", "hydroflow-resident-contact-sheet.csv");
                    await syncBackendAudit(action);
                    toast(t("Contact sheet downloaded"), t("Resident contact sheet exported."), "success");
                }
            } catch (error) {
                toast("Resident kit action failed", error.message || "Backend sync was not completed.", "warning");
            } finally {
                button.disabled = false;
            }
        }));

        document.addEventListener("hydroflow:backend-refreshed", () => {
            if (modal.classList.contains("is-open") && residentKitMode === "reminder_script") syncReminderModal();
        });
        document.addEventListener("hydroflow:language-changed", () => {
            if (modal.classList.contains("is-open") && residentKitMode === "reminder_script") syncReminderModal();
        });
    };

    document.addEventListener("click", (event) => {
        const alertQuickOpen = event.target.closest("[data-system-alert-link]");
        if (alertQuickOpen) {
            event.preventDefault();
            const adminUrl = alertQuickOpen.dataset.adminUrl || "";
            const lang = storage.getItem("hydroflow-lang") || "en";
            if (adminUrl) {
                toast(translateValue("Critical alert opened", lang), translateValue("Open alert in admin", lang), "info");
                window.location.assign(adminUrl);
            } else {
                openOverlayById("system-alerts-config-modal");
            }
        }
    });

    setupResidentKitTools();

    const checklistItemsSnapshot = () => (Array.isArray(billingData.checklistItems)
        ? billingData.checklistItems.map((item) => ({
            id: item.id,
            backendId: item.backendId,
            title: item.title,
            detail: item.detail,
            tag: item.tag || "Operations",
            icon: item.icon || "fact_check",
            done: Boolean(item.done),
        }))
        : []);
    const checklistNotesSnapshot = () => (Array.isArray(billingData.checklistNotes) ? billingData.checklistNotes.slice(0, 24).map((note) => ({
        id: note.id,
        backendId: note.backendId,
        title: note.text,
        detail: note.time,
        tag: "Note",
        icon: "edit_note",
        done: Boolean(note.done),
        custom: true,
    })) : []);
    const checklistEntriesSnapshot = () => ([
        ...checklistItemsSnapshot().map((item) => ({ ...item, custom: false })),
        ...checklistNotesSnapshot(),
    ]);
    const checklistProgressSnapshot = () => {
        const entries = checklistEntriesSnapshot();
        const completed = entries.filter((item) => item.done).length;
        const total = entries.length;
        const percent = Math.round((completed / Math.max(total, 1)) * 100);
        return { entries, completed, total, left: total - completed, percent };
    };
    const sidebarTodoLeftLabel = (left) => {
        return String(left);
    };
    const syncSidebarTodoCount = () => {
        const { left } = checklistProgressSnapshot();
        document.querySelectorAll("[data-notification-todo-count]").forEach((target) => {
            target.textContent = sidebarTodoLeftLabel(left);
            target.classList.toggle("is-complete", left === 0);
        });
    };
    const buildChecklistSummaryText = () => {
        const notes = checklistNotesSnapshot();
        const noteText = notes.length ? `\n\nNotes\n${notes.map((note) => `${note.done ? "[x]" : "[ ]"} ${note.detail}: ${note.title}`).join("\n")}` : "";
        return `HydroFlow checklist\n${checklistItemsSnapshot().map((item) => `${item.done ? "[x]" : "[ ]"} ${item.title} - ${item.tag}`).join("\n")}${noteText}`;
    };
    const renderChecklistEntriesMarkup = (entries) => entries.length ? entries.map((item) => {
        const done = Boolean(item.done);
        const isCustom = Boolean(item.custom);
        const id = escapeHtml(item.id);
        const backendId = escapeHtml(String(item.backendId || ""));
        const title = escapeHtml(item.title);
        const detail = escapeHtml(item.detail || "");
        const tag = escapeHtml(item.tag || "Note");
        const itemAttr = isCustom ? `data-checklist-note-toggle="${id}" data-checklist-note-backend-id="${backendId}"` : `data-checklist-item="${id}" data-checklist-item-backend-id="${backendId}"`;
        const deleteAttr = isCustom ? `data-checklist-note-delete="${id}" data-checklist-note-backend-id="${backendId}"` : "";
        const titleKey = isCustom ? "" : ` data-i18n-key="${title}"`;
        const detailKey = isCustom ? "" : ` data-i18n-key="${detail}"`;
        return `
            <article class="checklist-item ${isCustom ? "checklist-custom-item" : ""} ${done ? "is-done" : ""}" ${itemAttr} role="button" tabindex="0" aria-pressed="${done}">
                <span class="checklist-check material-symbols-outlined">${done ? "check" : escapeHtml(item.icon)}</span>
                <span>
                    <h3${titleKey}>${title}</h3>
                    <p${detailKey}>${detail}</p>
                </span>
                <span class="checklist-node-actions">
                    <span class="checklist-pill" data-i18n-key="${tag}">${tag}</span>
                    ${isCustom ? `<button class="checklist-delete-node" ${deleteAttr} type="button" aria-label="${translateValue("Delete", storage.getItem("hydroflow-lang") || "en")}"><span class="material-symbols-outlined">delete</span></button>` : ""}
                </span>
            </article>
        `;
    }).join("") : `
        <div class="checklist-empty-state">
            <span class="material-symbols-outlined">task_alt</span>
            <strong>${escapeHtml(translateValue("No backend checklist items", storage.getItem("hydroflow-lang") || "en"))}</strong>
            <p>${escapeHtml(translateValue("Create checklist items in Django admin to show them here.", storage.getItem("hydroflow-lang") || "en"))}</p>
        </div>
    `;

    const setupChecklist = () => {
        const drawer = document.getElementById("checklist-drawer");
        const list = drawer?.querySelector("[data-checklist-list]");
        if (!drawer || !list || drawer.dataset.checklistReady === "true") return;
        drawer.dataset.checklistReady = "true";
        const notesList = drawer.querySelector("[data-checklist-notes-list]");
        const composer = drawer.querySelector("[data-checklist-note-composer]");
        const noteTemplate = drawer.querySelector("[data-checklist-note-template]");
        const noteInput = drawer.querySelector("[data-checklist-note-input]");
        const visibleChecklistItems = () => checklistItemsSnapshot();
        const readNotes = () => Array.isArray(billingData.checklistNotes) ? billingData.checklistNotes.slice(0, 24) : [];
        const allChecklistEntries = (notes = readNotes()) => [
            ...visibleChecklistItems().map((item) => ({ ...item, done: Boolean(item.done), custom: false })),
            ...notes.map((note) => ({
                id: note.id,
                backendId: note.backendId,
                title: note.text,
                detail: note.time,
                tag: "Note",
                icon: "edit_note",
                done: Boolean(note.done),
                custom: true,
            })),
        ];
        const updateFab = () => {
            const left = allChecklistEntries().filter((item) => !item.done).length;
            const lang = storage.getItem("hydroflow-lang") || "en";
            const suffix = lang === "ru" ? "не выполнено" : lang === "uz" ? "qoldi" : left === 1 ? "task left" : "tasks left";
            document.querySelectorAll("[data-checklist-fab] small").forEach((target) => {
                target.innerHTML = `<b data-checklist-fab-count>${left}</b> ${suffix}`;
            });
            syncSidebarTodoCount();
            document.querySelectorAll("[data-checklist-fab]").forEach((button) => {
                button.classList.toggle("is-complete", left === 0);
                button.setAttribute("aria-label", `Open checklist, ${left} tasks left`);
            });
        };
        const render = () => {
            const notes = readNotes();
            const entries = allChecklistEntries(notes);
            list.innerHTML = entries.length ? entries.map((item) => {
                const done = Boolean(item.done);
                const isCustom = Boolean(item.custom);
                const id = escapeHtml(item.id);
                const title = escapeHtml(item.title);
                const detail = escapeHtml(item.detail || "");
                const tag = escapeHtml(item.tag || "Note");
                const itemAttr = isCustom ? `data-checklist-note-toggle="${id}"` : `data-checklist-item="${id}" data-checklist-item-backend-id="${escapeHtml(String(item.backendId || ""))}"`;
                const deleteAttr = isCustom ? `data-checklist-note-delete="${id}"` : `data-checklist-item-delete="${id}"`;
                const titleKey = isCustom ? "" : ` data-i18n-key="${title}"`;
                const detailKey = isCustom ? "" : ` data-i18n-key="${detail}"`;
                return `
                    <article class="checklist-item ${isCustom ? "checklist-custom-item" : ""} ${done ? "is-done" : ""}" ${itemAttr} role="button" tabindex="0" aria-pressed="${done}">
                        <span class="checklist-check material-symbols-outlined">${done ? "check" : escapeHtml(item.icon)}</span>
                        <span>
                            <h3${titleKey}>${title}</h3>
                            <p${detailKey}>${detail}</p>
                        </span>
                        <span class="checklist-node-actions">
                            <span class="checklist-pill" data-i18n-key="${tag}">${tag}</span>
                            ${isCustom ? `<button class="checklist-delete-node" ${deleteAttr} type="button" aria-label="${translateValue("Delete", storage.getItem("hydroflow-lang") || "en")}">
                                <span class="material-symbols-outlined">delete</span>
                            </button>` : ""}
                        </span>
                    </article>
                `;
            }).join("") : `
                <div class="checklist-empty-state">
                    <span class="material-symbols-outlined">task_alt</span>
                    <strong>${escapeHtml(translateValue("No backend checklist items", storage.getItem("hydroflow-lang") || "en"))}</strong>
                    <p>${escapeHtml(translateValue("Create checklist items in Django admin to show them here.", storage.getItem("hydroflow-lang") || "en"))}</p>
                </div>
            `;
            if (notesList) {
                notesList.innerHTML = "";
                notesList.classList.add("hidden");
            }
            const completed = entries.filter((item) => item.done).length;
            const percent = Math.round((completed / Math.max(entries.length, 1)) * 100);
            drawer.style.setProperty("--checklist-progress", `${percent}%`);
            drawer.querySelector("[data-checklist-progress-label]").textContent = `${percent}%`;
            const saved = drawer.querySelector("[data-checklist-saved]");
            if (saved) {
                saved.textContent = "Synced to backend";
                saved.dataset.i18nKey = "Synced to backend";
            }
            drawer.querySelector(".checklist-progress-bar")?.setAttribute("aria-valuenow", String(percent));
            updateFab();
            window.HydroFlowSyncLocale?.();
        };
        const openChecklist = (scope = "Current workspace") => {
            const scopeNode = drawer.querySelector("[data-checklist-scope]");
            if (scopeNode) scopeNode.textContent = scope;
            drawer.querySelector("[data-checklist-subtitle]").textContent = `${scope} readiness flow with saved progress.`;
            render();
            openOverlayById("checklist-drawer");
            toast(translateValue("Checklist opened", storage.getItem("hydroflow-lang") || "en"), `${scope} checklist is ready.`, "info");
        };
        list.addEventListener("click", (event) => {
            const itemDelete = event.target.closest("[data-checklist-item-delete]");
            const noteDelete = event.target.closest("[data-checklist-note-delete]");
            if (itemDelete || noteDelete) {
                event.preventDefault();
                event.stopPropagation();
                if (itemDelete) {
                    return;
                }
                if (noteDelete) {
                    const id = noteDelete.dataset.checklistNoteDelete;
                    postPortalJson("/api/checklist/note/", {
                        mode: "delete",
                        note_id: String(id).replace("note-", ""),
                    }).then((payload) => {
                        rehydrateFromPortalData(payload.portalData);
                        toast(translateValue("Checklist note removed", storage.getItem("hydroflow-lang") || "en"), translateValue("Removed from backend checklist.", storage.getItem("hydroflow-lang") || "en"), "info");
                    }).catch((error) => {
                        toast("Checklist note removal failed", error.message, "danger");
                    });
                }
                render();
                playSound("click");
                return;
            }
            const note = event.target.closest("[data-checklist-note-toggle]");
            if (note) {
                postPortalJson("/api/checklist/note/", {
                    mode: "toggle",
                    note_id: String(note.dataset.checklistNoteToggle || "").replace("note-", ""),
                }).then((payload) => {
                    rehydrateFromPortalData(payload.portalData);
                    playSound("toggle");
                }).catch((error) => {
                        toast("Checklist note update failed", error.message, "danger");
                    });
                return;
            }
            const item = event.target.closest("[data-checklist-item]");
            if (!item) return;
            postPortalJson("/api/checklist/item/", {
                mode: "toggle",
                item_id: item.dataset.checklistItemBackendId,
            }).then((payload) => {
                rehydrateFromPortalData(payload.portalData);
                playSound("toggle");
            }).catch((error) => {
                toast("Checklist item update failed", error.message, "danger");
            });
        });
        drawer.querySelector("[data-checklist-action='complete-visible']")?.addEventListener("click", () => {
            postPortalJson("/api/checklist/item/", {
                mode: "complete_visible",
                item_ids: visibleChecklistItems().map((item) => item.backendId).filter(Boolean),
            }).then((payload) => {
                rehydrateFromPortalData(payload.portalData);
                toast("Checklist completed", "All visible checklist items are marked complete.", "success");
            }).catch((error) => {
                toast("Checklist completion failed", error.message, "danger");
            });
        });
        drawer.querySelector("[data-checklist-action='reset']")?.addEventListener("click", () => {
            postPortalJson("/api/checklist/item/", {
                mode: "reset_all",
            }).then((payload) => {
                rehydrateFromPortalData(payload.portalData);
                toast("Checklist reset", "Checklist progress was cleared for all admins.", "warning");
            }).catch((error) => {
                toast("Checklist reset failed", error.message, "danger");
            });
        });
        drawer.querySelector("[data-checklist-action='copy']")?.addEventListener("click", async () => {
            const notes = readNotes();
            const noteText = notes.length ? `\n\nNotes\n${notes.map((note) => `${note.done ? "[x]" : "[ ]"} ${note.time}: ${note.text}`).join("\n")}` : "";
            const text = `HydroFlow checklist\n${visibleChecklistItems().map((item) => `${item.done ? "[x]" : "[ ]"} ${item.title} - ${item.tag}`).join("\n")}${noteText}`;
            try {
                await navigator.clipboard?.writeText(text);
                toast("Checklist copied", "Summary copied to clipboard.", "success");
            } catch {
                toast("Checklist summary", text, "info");
            }
        });
        drawer.querySelector("[data-checklist-action='toggle-note']")?.addEventListener("click", () => {
            composer?.classList.toggle("hidden");
            noteInput?.focus();
        });
        drawer.querySelector("[data-checklist-action='cancel-note']")?.addEventListener("click", () => {
            composer?.classList.add("hidden");
            if (noteInput) noteInput.value = "";
            if (noteTemplate) noteTemplate.value = "";
        });
        noteTemplate?.addEventListener("change", () => {
            const selected = noteTemplate.selectedOptions?.[0];
            const key = selected?.dataset.templateTextKey || noteTemplate.value;
            if (noteInput && key) {
                noteInput.value = translateValue(key, storage.getItem("hydroflow-lang") || "en");
            }
        });
        drawer.querySelector("[data-checklist-action='save-note']")?.addEventListener("click", () => {
            const text = noteInput?.value.trim() || "";
            if (!text) {
                toast("Checklist note required", "Choose a template or write a custom note.", "warning");
                noteInput?.focus();
                return;
            }
            postPortalJson("/api/checklist/note/", {
                mode: "create",
                text,
                template_key: noteTemplate?.value || "",
                scope: drawer.querySelector("[data-checklist-scope]")?.textContent?.trim()
                    || drawer.querySelector("[data-checklist-subtitle]")?.textContent?.replace(/\s+readiness flow.*$/i, "").trim()
                    || "Operations",
            }).then((payload) => {
                if (noteInput) noteInput.value = "";
                if (noteTemplate) noteTemplate.value = "";
                composer?.classList.add("hidden");
                rehydrateFromPortalData(payload.portalData);
                toast("Checklist note added", "Stored in backend checklist and audit trail.", "success");
            }).catch((error) => {
                toast("Checklist note save failed", error.message, "danger");
            });
        });
        drawer.querySelector("[data-checklist-action='open-audit']")?.addEventListener("click", () => openOverlayById("audit-drawer"));
        drawer.querySelector("[data-checklist-action='mark-reviewed']")?.addEventListener("click", () => {
            postPortalJson("/api/checklist/item/", {
                mode: "mark_reviewed",
            }).then((payload) => {
                rehydrateFromPortalData(payload.portalData);
                render();
                toast("Checklist reviewed", "All backend checklist items were marked complete.", "success");
            }).catch((error) => {
                toast("Review save failed", error.message, "danger");
            });
        });
        document.querySelectorAll("[data-checklist-fab]").forEach((button) => {
            button.addEventListener("click", () => openChecklist("Operations"));
        });
        window.HydroFlowOpenChecklist = openChecklist;
        window.HydroFlowRenderChecklist = render;
        render();
    };
    document.addEventListener("hydroflow:language-changed", () => syncSidebarTodoCount());

    document.addEventListener("click", (event) => {
        const openTrigger = event.target.closest("[data-drawer-open], [data-modal-open]");
        if (!openTrigger) return;
        const id = openTrigger.dataset.drawerOpen || openTrigger.dataset.modalOpen || "";
        if (!id) return;
        event.preventDefault();
        event.stopPropagation();
        document.querySelector(".account-menu")?.classList.add("hidden");
        document.querySelector("[data-account-toggle]")?.setAttribute("aria-expanded", "false");
        openOverlayById(id);
    }, true);

    document.addEventListener("click", (event) => {
        const closeButton = event.target.closest("[data-close-overlay]");
        if (!closeButton) return;
        const overlay = closeButton.closest(".app-modal, .app-drawer");
        if (overlay?.id) closeOverlayById(overlay.id);
    });

    const recentCommandKey = "hydroflow-recent-commands";
    const recentSearchKey = "hydroflow-recent-searches";
    const userStorageScope = (() => {
        const profile = billingData.profile || {};
        const id = String(profile.id || "").trim();
        const username = String(profile.username || "").trim().toLowerCase();
        return id || username || "anonymous";
    })();
    const scopedStorageKey = (baseKey) => `${baseKey}:${userStorageScope}`;
    const scopedRecentCommandKey = scopedStorageKey(recentCommandKey);
    const scopedRecentSearchKey = scopedStorageKey(recentSearchKey);
    const shouldResetRecentStorage = () => {
        const backendConnected = billingData.source === "backend";
        const residentsEmpty = !Array.isArray(billingData.residents) || billingData.residents.length === 0;
        const complexesEmpty = !Array.isArray(billingData.complexes) || billingData.complexes.length === 0;
        const transactionsEmpty = !Array.isArray(billingData.transactions) || billingData.transactions.length === 0;
        return !backendConnected || (residentsEmpty && complexesEmpty && transactionsEmpty);
    };
    if (shouldResetRecentStorage()) {
        storage.removeItem(scopedRecentSearchKey);
        storage.removeItem(scopedRecentCommandKey);
        storage.removeItem(recentSearchKey);
        storage.removeItem(recentCommandKey);
    }
    const commandPalette = document.getElementById("command-palette");
    const commandInput = document.querySelector("[data-command-input]");
    const commandResults = document.querySelector("[data-command-results]");
    const commandEmpty = document.querySelector("[data-command-empty]");
    const closeCommandPalette = ({ withWater = true } = {}) => {
        if (!commandPalette || !commandPalette.classList.contains("is-open")) return;
        if (!withWater || reducedMotionQuery?.matches) {
            closeOverlayById("command-palette");
            return;
        }
        if (commandPalette.dataset.closing === "true") return;
        commandPalette.dataset.closing = "true";
        commandPalette.classList.add("command-palette-closing");
        playSound("modal-close-water");
        window.setTimeout(() => {
            closeOverlayById("command-palette");
            commandPalette.classList.remove("command-palette-closing");
            delete commandPalette.dataset.closing;
        }, 240);
    };
    const getCommandItems = () => Array.from(document.querySelectorAll("[data-command-results] .command-item"));
    const getRecentCommands = () => {
        try {
            const scoped = storage.getItem(scopedRecentCommandKey);
            if (scoped) return JSON.parse(scoped);
            const legacy = storage.getItem(recentCommandKey);
            if (legacy) {
                storage.setItem(scopedRecentCommandKey, legacy);
                storage.removeItem(recentCommandKey);
                return JSON.parse(legacy);
            }
            return [];
        } catch {
            return [];
        }
    };
    const getRecentSearches = () => {
        try {
            const scoped = storage.getItem(scopedRecentSearchKey);
            if (scoped) return JSON.parse(scoped);
            const legacy = storage.getItem(recentSearchKey);
            if (legacy) {
                storage.setItem(scopedRecentSearchKey, legacy);
                storage.removeItem(recentSearchKey);
                return JSON.parse(legacy);
            }
            return [];
        } catch {
            return [];
        }
    };
    const normalizeCommandSearch = (value) => String(value || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    const saveRecentSearch = (query) => {
        const value = String(query || "").trim();
        if (!value) return;
        const recent = getRecentSearches().filter((item) => item !== value);
        recent.unshift(value);
        storage.setItem(scopedRecentSearchKey, JSON.stringify(recent.slice(0, 6)));
    };
    const saveRecentCommand = (button) => {
        const title = button.querySelector("span")?.textContent?.trim();
        if (!title) return;
        const command = {
            id: button.dataset.commandId || title,
            title,
            subtitle: button.querySelector("small")?.textContent?.trim() || "",
            action: button.dataset.commandAction || "",
            url: button.dataset.commandUrl || "",
            drawer: button.dataset.drawerOpen || "",
            export: button.hasAttribute("data-export-open"),
        };
        const recent = getRecentCommands().filter((item) => item.id !== command.id);
        recent.unshift(command);
        storage.setItem(scopedRecentCommandKey, JSON.stringify(recent.slice(0, 4)));
        renderRecentCommands();
    };
    const renderRecentCommands = () => {
        const wrap = document.querySelector("[data-command-recent-wrap]");
        const target = document.querySelector("[data-command-recent]");
        if (!wrap || !target) return;
        const recent = getRecentSearches();
        const items = recent;
        wrap.classList.toggle("hidden", items.length === 0);
        target.innerHTML = items.slice(0, 6).map((item) => `
            <button class="command-recent-chip" data-command-recent-query="${escapeAttr(item)}" type="button">
                <span>${escapeHtml(item)}</span>
            </button>
        `).join("");
    };
    const commandSearchIndex = () => {
        const buildings = billingData.complexes.flatMap((complex) => (
            Array.isArray(complex.buildingItems)
                ? complex.buildingItems.map((building) => ({ complex, building }))
                : []
        ));
        const apartments = buildings.flatMap(({ complex, building }) => (
            Array.isArray(building.apartments)
                ? building.apartments.map((apartment) => ({ complex, building, apartment }))
                : []
        ));
        const residentEntries = billingData.residents.map((resident) => {
            const complex = getComplexById(resident.complexId);
            const title = resident.name || resident.fio || "";
            const apartmentLabel = resident.apartmentNumber || resident.apartment || "";
            const buildingLabel = resident.building || "";
            const search = [
                title,
                resident.phone,
                resident.personalAccount,
                apartmentLabel,
                buildingLabel,
                complex?.name,
                complex?.sector,
            ].filter(Boolean).join(" ");
            return {
                id: `resident-${resident.id}`,
                type: "resident",
                title,
                meta: [apartmentLabel, buildingLabel || complex?.name].filter(Boolean).join(" · "),
                account: resident.personalAccount || "",
                search: normalizeCommandSearch(search),
                residentId: resident.id,
                ownerBackendId: resident.ownerBackendId || resident.backendId || resident.displayId || "",
                adminUrl: resident.adminUrl || "",
                commandQuery: title || apartmentLabel || buildingLabel || "",
            };
        });
        const buildingEntries = buildings.map(({ complex, building }) => ({
            id: `building-${building.backendId || building.id || building.number}`,
            type: "building",
            title: building.name || `House ${building.number || ""}`.trim(),
            meta: [complex?.name, building.address].filter(Boolean).join(" · "),
            search: normalizeCommandSearch([
                building.name,
                building.number,
                building.address,
                complex?.name,
                complex?.sector,
            ].filter(Boolean).join(" ")),
            commandQuery: building.name || building.number || complex?.name || "",
            buildingId: building.backendId || "",
            complexId: complex?.id || "",
        }));
        const apartmentEntries = apartments.map(({ complex, building, apartment }) => {
            const ownerName = apartment.owner?.name || "";
            const unit = apartment.unit || apartment.number || "";
            const buildingName = building.name || `House ${building.number || ""}`.trim();
            return {
                id: `apartment-${apartment.apartmentBackendId || apartment.backendId || unit}`,
                type: "apartment",
                title: `Apartment ${unit}`.trim(),
                meta: [buildingName, ownerName].filter(Boolean).join(" · "),
                account: apartment.personalAccount || "",
                search: normalizeCommandSearch([
                    unit,
                    apartment.personalAccount,
                    ownerName,
                    apartment.owner?.phone,
                    complex?.name,
                    buildingName,
                    apartment.contract,
                ].filter(Boolean).join(" ")),
                commandQuery: ownerName || unit || buildingName || "",
                apartmentData: {
                    title: `Apartment ${unit}`.trim(),
                    subtitle: [buildingName, complex?.name].filter(Boolean).join(" · "),
                    owner: ownerName || "Unassigned owner",
                    photo: apartment.owner?.photo || "",
                    phone: apartment.owner?.phone || "",
                    email: apartment.owner?.email || "",
                    balance: formatBillingUzs(Number(apartment.balance || 0)),
                    status: apartment.status || "Paid",
                    unit,
                    rooms: apartment.rooms || "Apartment",
                    area: apartment.area || "",
                    personalAccount: apartment.personalAccount || "",
                    meter: apartment.meter || "",
                    charge: apartment.charge || "",
                    occupancy: apartment.occupancy || "Resident",
                    contract: apartment.contract || "",
                    visit: apartment.visit || "",
                    payment: apartment.lastPayment || "",
                    ownerBackendId: apartment.ownerBackendId || "",
                    apartmentBackendId: apartment.apartmentBackendId || apartment.backendId || "",
                    buildingBackendId: apartment.buildingBackendId || building.backendId || "",
                    complexBackendId: apartment.complexBackendId || complex?.backendId || "",
                },
            };
        });
        return [...residentEntries, ...apartmentEntries, ...buildingEntries];
    };
    const commandTypeToken = (type) => {
        if (type === "resident") return { icon: "person", label: "Person", tone: "is-resident" };
        if (type === "apartment") return { icon: "door_front", label: "Apartment", tone: "is-apartment" };
        if (type === "building") return { icon: "home_work", label: "House", tone: "is-building" };
        return { icon: "travel_explore", label: "Result", tone: "is-generic" };
    };
    const renderCommandResults = (entries) => {
        if (!commandResults) return;
        commandResults.innerHTML = entries.map((entry) => `
            ${(() => {
                const token = commandTypeToken(entry.type);
                return `
            <button
                class="command-item ${token.tone}"
                data-command-id="${escapeAttr(entry.id)}"
                data-command-target-type="${escapeAttr(entry.type)}"
                data-command-resident-id="${escapeAttr(entry.residentId || "")}"
                data-command-owner-backend-id="${escapeAttr(entry.ownerBackendId || "")}"
                data-command-building-id="${escapeAttr(entry.buildingId || "")}"
                data-command-complex-id="${escapeAttr(entry.complexId || "")}"
                data-command-query="${escapeAttr(entry.commandQuery || "")}"
                data-command-search="${escapeAttr(entry.search || "")}"
                data-command-url="${escapeAttr(entry.url || "")}"
                data-command-admin-url="${escapeAttr(entry.adminUrl || "")}"
                type="button"
            >
                <span class="command-item-icon material-symbols-outlined" data-command-icon aria-hidden="true">${token.icon}</span>
                <span class="command-item-copy">
                    <span class="command-item-title" data-command-title>${escapeHtml(entry.title)}</span>
                    ${entry.meta ? `<small class="command-item-meta" data-command-meta>${escapeHtml(entry.meta)}</small>` : ""}
                    ${entry.account ? `<small class="command-item-meta command-item-account" data-command-meta>${escapeHtml(`${t("Personal account")}: ${entry.account}`)}</small>` : ""}
                </span>
                <span class="command-item-type">${token.label}</span>
            </button>
            `;
            })()}
        `).join("");
    };
    let commandSearchRequestId = 0;
    const mergeCommandEntries = (entries) => {
        const seen = new Set();
        return entries.filter((entry) => {
            // The same resident comes from the page data and from the server; both carry its row id
            // ("owner-5", or "apartment-7" for a vacant apartment), so key residents by it.
            const residentKey = entry.type === "resident" && entry.residentId ? `resident:${entry.residentId}` : "";
            const key = residentKey || entry.id || `${entry.type}:${entry.title}:${entry.meta}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };
    const fetchResidentCommandEntries = async (query, requestId) => {
        const response = await fetch(`/api/lists/residents/?page=1&page_size=10&search=${encodeURIComponent(query)}`, {
            cache: "no-store",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
        });
        if (redirectToLoginIfUnauthorized(response)) return [];
        if (!response.ok || requestId !== commandSearchRequestId) return [];
        const payload = await response.json();
        return (payload.results || []).map((resident) => ({
            id: `resident-api-${resident.id || resident.backendId || resident.ownerBackendId}`,
            type: "resident",
            title: resident.name || "Resident",
            meta: [resident.apartment, resident.building || resident.complex, resident.phone].filter(Boolean).join(" · "),
            account: resident.personalAccount || "",
            search: normalizeCommandSearch([
                resident.name,
                resident.phone,
                resident.personalAccount,
                resident.apartment,
                resident.building,
                resident.complex,
                resident.contract,
            ].filter(Boolean).join(" ")),
            residentId: resident.id || (resident.ownerBackendId ? `owner-${resident.ownerBackendId}` : ""),
            ownerBackendId: resident.ownerBackendId || resident.backendId || "",
            adminUrl: resident.adminUrl || "",
            commandQuery: resident.name || query,
        }));
    };
    const residentProfileModal = document.getElementById("resident-command-profile-modal");
    const residentProfileState = { resident: null };
    const residentProfileNodes = residentProfileModal ? {
        panel: residentProfileModal.querySelector(".resident-command-profile-panel"),
        nameTitle: residentProfileModal.querySelector("[data-resident-profile-name]"),
        nameCopy: residentProfileModal.querySelector("[data-resident-profile-name-copy]"),
        subtitle: residentProfileModal.querySelector("[data-resident-profile-subtitle]"),
        id: residentProfileModal.querySelector("[data-resident-profile-id]"),
        phone: residentProfileModal.querySelector("[data-resident-profile-phone]"),
        balanceWrap: residentProfileModal.querySelector("[data-resident-profile-balance-wrap]"),
        balance: residentProfileModal.querySelector("[data-resident-profile-balance]"),
        balanceIcon: residentProfileModal.querySelector("[data-resident-profile-balance-icon]"),
        tgUser: residentProfileModal.querySelector("[data-resident-profile-tg-user]"),
        tgStatus: residentProfileModal.querySelector("[data-resident-profile-tg-status]"),
        contract: residentProfileModal.querySelector("[data-resident-profile-contract]"),
        house: residentProfileModal.querySelector("[data-resident-profile-house]"),
        apartment: residentProfileModal.querySelector("[data-resident-profile-apartment]"),
        account: residentProfileModal.querySelector("[data-resident-profile-account]"),
        copyButtons: residentProfileModal.querySelectorAll("[data-resident-profile-copy]"),
        photo: residentProfileModal.querySelector("[data-resident-profile-photo]"),
        fallback: residentProfileModal.querySelector("[data-resident-profile-fallback]"),
        historyButton: residentProfileModal.querySelector("[data-resident-profile-history]"),
        editLink: residentProfileModal.querySelector("[data-resident-profile-edit]"),
        billingButton: residentProfileModal.querySelector("[data-resident-profile-billing-notice]"),
        addPaymentButton: residentProfileModal.querySelector("[data-resident-profile-add-payment]"),
    } : null;
    const extractOwnerBackendId = (...values) => {
        for (const value of values) {
            const normalized = String(value || "").replace(/[^\d]/g, "");
            if (normalized) return normalized;
        }
        return "";
    };
    const residentFromLocalState = (residentId, ownerBackendId) => {
        const byId = residentId ? getResidentById(residentId) : null;
        if (byId) return byId;
        const ownerId = extractOwnerBackendId(ownerBackendId, residentId);
        if (!ownerId) return null;
        return billingData.residents.find((resident) => extractOwnerBackendId(resident.ownerBackendId, resident.backendId, resident.id) === ownerId) || null;
    };
    const hasResidentContract = (resident) => {
        if (!resident || typeof resident !== "object") return false;
        if (resident.hasContract === true) return true;
        if (resident.hasContract === false) return false;
        const contractValue = String(resident.contract ?? resident.contractStatus ?? "").toLowerCase();
        return contractValue === "true" || contractValue === "1" || contractValue === "yes";
    };
    const setResidentProfileLoading = (isLoading) => {
        residentProfileNodes?.panel?.classList.toggle("is-loading", Boolean(isLoading));
        residentProfileNodes?.copyButtons?.forEach((button) => {
            button.disabled = Boolean(isLoading) || !button.dataset.copyValue;
        });
    };
    const renderResidentCommandProfileSkeleton = (fallback = null) => {
        if (!residentProfileNodes) return;
        residentProfileState.resident = null;
        const fallbackName = fallback?.name || t("Loading profile");
        residentProfileNodes.nameTitle.textContent = fallbackName;
        residentProfileNodes.nameCopy.textContent = fallbackName;
        residentProfileNodes.subtitle.textContent = t("Loaded from database");
        residentProfileNodes.id.textContent = fallback?.displayId || extractOwnerBackendId(fallback?.ownerBackendId, fallback?.backendId, fallback?.id) || "000";
        residentProfileNodes.phone.textContent = fallback?.phone || "+998 00 000-0000";
        residentProfileNodes.house.textContent = fallback?.building || "House";
        residentProfileNodes.apartment.textContent = String(fallback?.apartmentNumber || fallback?.apartment || "000");
        if (residentProfileNodes.account) residentProfileNodes.account.textContent = fallback?.personalAccount || "--";
        residentProfileNodes.balance.textContent = formatBillingUzs(Number(fallback?.balance || 0));
        residentProfileNodes.balanceIcon.textContent = "hourglass_top";
        residentProfileNodes.balanceWrap.classList.remove("is-negative");
        residentProfileNodes.balanceWrap.classList.add("is-positive");
        residentProfileNodes.tgUser.textContent = formatTelegramHandle(fallback?.telegramUser) || "@telegram";
        residentProfileNodes.tgStatus.textContent = t("Linked");
        residentProfileNodes.contract.textContent = t("True");
        residentProfileNodes.copyButtons.forEach((button) => {
            button.dataset.copyValue = "";
            button.disabled = true;
            button.classList.remove("is-copied");
            const icon = button.querySelector(".material-symbols-outlined");
            if (icon) icon.textContent = "content_copy";
        });
        residentProfileNodes.photo.classList.add("hidden");
        residentProfileNodes.photo.src = "";
        residentProfileNodes.fallback.classList.remove("hidden");
        if (residentProfileNodes.editLink) {
            residentProfileNodes.editLink.href = "#";
            residentProfileNodes.editLink.classList.add("is-disabled");
        }
        residentProfileNodes.historyButton?.removeAttribute("data-owner-backend-id");
        residentProfileNodes.billingButton?.removeAttribute("data-owner-backend-id");
        // Shown once the balance is known, and only for a debt.
        residentProfileNodes.billingButton?.classList.add("hidden");
        setResidentProfileLoading(true);
    };
    const renderResidentCommandProfile = (resident) => {
        if (!residentProfileNodes || !resident) return;
        residentProfileState.resident = resident;
        setResidentProfileLoading(false);
        const displayId = resident.displayId || extractOwnerBackendId(resident.ownerBackendId, resident.backendId, resident.id) || "--";
        const name = resident.name || "Resident";
        const phone = resident.phone || "--";
        const house = resident.building || "--";
        const apartment = resident.apartmentNumber || resident.apartment || "--";
        const account = resident.personalAccount || "--";
        const balanceValue = Number(resident.balance || 0);
        const isPositiveBalance = balanceValue >= 0;
        const telegramUser = formatTelegramHandle(resident.telegramUser);
        // The Telegram bot sets the status when the resident registers there.
        const telegramConnected = Boolean(resident.telegramConnected);
        const hasContract = hasResidentContract(resident);
        const ownerBackendId = extractOwnerBackendId(resident.ownerBackendId, resident.backendId, resident.id);

        residentProfileNodes.nameTitle.textContent = name;
        residentProfileNodes.nameCopy.textContent = name;
        residentProfileNodes.subtitle.textContent = [resident.complex, house, apartment].filter(Boolean).join(" · ") || t("Loaded from database");
        residentProfileNodes.id.textContent = String(displayId);
        residentProfileNodes.phone.textContent = phone;
        residentProfileNodes.house.textContent = house;
        residentProfileNodes.apartment.textContent = String(apartment);
        if (residentProfileNodes.account) residentProfileNodes.account.textContent = account;
        residentProfileNodes.copyButtons.forEach((button) => {
            const type = button.dataset.residentProfileCopy;
            const value = type === "telegram" ? telegramUser : type === "house" ? house : type === "account" ? account : String(apartment);
            button.dataset.copyValue = value && value !== "--" ? value : "";
            button.disabled = !button.dataset.copyValue;
            button.setAttribute("aria-label", `${t("Copy")} ${t(button.dataset.copyLabel || "")}`.trim());
        });

        residentProfileNodes.balance.textContent = formatBillingUzs(balanceValue);
        residentProfileNodes.balanceIcon.textContent = isPositiveBalance ? "verified" : "error";
        residentProfileNodes.balanceWrap.classList.toggle("is-positive", isPositiveBalance);
        residentProfileNodes.balanceWrap.classList.toggle("is-negative", !isPositiveBalance);

        residentProfileNodes.tgUser.textContent = telegramHandleText(resident);
        residentProfileNodes.tgUser.classList.toggle("is-connected", Boolean(telegramUser));
        residentProfileNodes.tgUser.classList.toggle("is-missing", !telegramUser);

        residentProfileNodes.tgStatus.textContent = telegramConnected ? t("Linked") : t("Not linked");
        residentProfileNodes.tgStatus.classList.toggle("is-connected", telegramConnected);
        residentProfileNodes.tgStatus.classList.toggle("is-missing", !telegramConnected);

        residentProfileNodes.contract.textContent = hasContract ? t("True") : t("False");
        residentProfileNodes.contract.classList.toggle("is-contract-true", hasContract);
        residentProfileNodes.contract.classList.toggle("is-contract-false", !hasContract);

        const photoUrl = String(resident.photo || "").trim();
        if (photoUrl) {
            residentProfileNodes.photo.src = photoUrl;
            residentProfileNodes.photo.alt = `${name}`;
            residentProfileNodes.photo.classList.remove("hidden");
            residentProfileNodes.fallback.classList.add("hidden");
        } else {
            residentProfileNodes.photo.classList.add("hidden");
            residentProfileNodes.photo.src = "";
            residentProfileNodes.fallback.classList.remove("hidden");
        }

        const editUrl = String(resident.adminUrl || "").trim();
        residentProfileNodes.editLink.href = editUrl || "#";
        residentProfileNodes.editLink.classList.toggle("is-disabled", !editUrl);
        residentProfileNodes.historyButton.dataset.ownerBackendId = ownerBackendId;
        residentProfileNodes.billingButton.dataset.ownerBackendId = ownerBackendId;
        // A payment notice is about a debt: a resident at zero or in credit has none to notify.
        residentProfileNodes.billingButton.classList.toggle("hidden", isPositiveBalance);
    };
    const fetchResidentForCommand = async (ownerBackendId) => {
        if (!ownerBackendId) return null;
        const payload = await fetchServerList("/api/lists/residents/", {
            page: 1,
            page_size: 1,
            owner_id: ownerBackendId,
        });
        return payload?.results?.[0] || null;
    };
    const openResidentProfileByOwner = async ({ ownerBackendId = "", fallback = null, closePalette = false } = {}) => {
        if (!residentProfileModal || !residentProfileNodes) return;
        if (closePalette) closeCommandPalette({ withWater: false });
        if (!ownerBackendId) {
            toast("Resident profile", "Could not resolve resident ID for database lookup.", "warning");
            return;
        }
        renderResidentCommandProfileSkeleton(fallback);
        openOverlayById("resident-command-profile-modal", { sound: "profile-open" });
        let resident = null;
        try {
            resident = await fetchResidentForCommand(ownerBackendId);
        } catch (error) {
            console.warn("Resident profile fetch failed", error);
        }
        if (!resident && fallback) {
            resident = fallback;
        }
        if (!resident) {
            setResidentProfileLoading(false);
            closeOverlayById("resident-command-profile-modal");
            toast("Resident profile", "Could not load resident data from database.", "warning");
            return;
        }
        renderResidentCommandProfile(resident);
    };
    const openResidentCommandProfile = async (button) => {
        if (!button || !residentProfileModal || !residentProfileNodes) return;
        const fallback = residentFromLocalState(button.dataset.commandResidentId, button.dataset.commandOwnerBackendId);
        const ownerBackendId = extractOwnerBackendId(
            button.dataset.commandOwnerBackendId,
            button.dataset.commandResidentId,
            fallback?.ownerBackendId,
            fallback?.backendId,
            fallback?.id
        );
        return openResidentProfileByOwner({ ownerBackendId, fallback, closePalette: true });
    };
    if (residentProfileModal && residentProfileNodes && residentProfileModal.dataset.commandProfileReady !== "true") {
        residentProfileModal.dataset.commandProfileReady = "true";
        residentProfileModal.addEventListener("click", (event) => {
            if (event.target !== residentProfileModal) return;
            closeOverlayById("resident-command-profile-modal");
        });
        residentProfileNodes.historyButton?.addEventListener("click", () => {
            if (!residentProfileState.resident) return;
            window.HydroFlowOpenResidentHistory?.(residentProfileState.resident);
        });
        // Add payment for the resident shown: the payment window opens with them chosen.
        residentProfileNodes.addPaymentButton?.addEventListener("click", () => {
            if (!residentProfileState.resident) return;
            const ownerBackendId = extractOwnerBackendId(
                residentProfileState.resident.ownerBackendId,
                residentProfileState.resident.backendId,
                residentProfileState.resident.id
            );
            if (ownerBackendId) window.HydroFlowOpenAddPaymentForResident?.(ownerBackendId);
        });
        residentProfileNodes.billingButton?.addEventListener("click", () => {
            if (!residentProfileState.resident) return;
            const ownerBackendId = extractOwnerBackendId(
                residentProfileState.resident.ownerBackendId,
                residentProfileState.resident.backendId,
                residentProfileState.resident.id
            );
            if (window.HydroFlowOpenBillingNoticeForResident) {
                window.HydroFlowOpenBillingNoticeForResident(ownerBackendId);
                return;
            }
            document.querySelector("[data-billing-notice-open]")?.click();
        });
        residentProfileNodes.copyButtons.forEach((button) => {
            button.addEventListener("click", async (event) => {
                event.preventDefault();
                event.stopPropagation();
                const value = String(button.dataset.copyValue || "").trim();
                if (!value) return;
                const label = t(button.dataset.copyLabel || "Copy");
                const icon = button.querySelector(".material-symbols-outlined");
                window.clearTimeout(button._copyFeedbackTimer);
                try {
                    if (!navigator.clipboard?.writeText) {
                        throw new Error("Clipboard API is unavailable");
                    }
                    await navigator.clipboard.writeText(value);
                    playSound("copy");
                    button.classList.add("is-copied");
                    if (icon) icon.textContent = "check";
                    button._copyFeedbackTimer = window.setTimeout(() => {
                        button.classList.remove("is-copied");
                        if (icon) icon.textContent = "content_copy";
                    }, 850);
                    toast(t("Copied"), `${label}: ${value}`, "success", { sound: false });
                } catch {
                    if (icon) icon.textContent = "content_copy";
                    playSound("error");
                    toast(label, value, "info");
                }
            });
        });
    }
    const addPaymentModal = document.getElementById("add-payment-modal");
    const addPaymentState = {
        residents: [],
        selectedResident: null,
        operation: "credit",
        channel: "cash",
        submitting: false,
        preselectedOwnerId: "",
    };
    const addPaymentNodes = addPaymentModal ? {
        search: addPaymentModal.querySelector("[data-add-payment-search]"),
        searchClear: addPaymentModal.querySelector("[data-add-payment-search-clear]"),
        results: addPaymentModal.querySelector("[data-add-payment-results]"),
        empty: addPaymentModal.querySelector("[data-add-payment-empty]"),
        status: addPaymentModal.querySelector("[data-add-payment-status]"),
        residentCard: addPaymentModal.querySelector("[data-add-payment-resident-card]"),
        placeholder: addPaymentModal.querySelector("[data-add-payment-placeholder]"),
        photo: addPaymentModal.querySelector("[data-add-payment-photo]"),
        fallback: addPaymentModal.querySelector("[data-add-payment-fallback]"),
        displayId: addPaymentModal.querySelector("[data-add-payment-display-id]"),
        name: addPaymentModal.querySelector("[data-add-payment-name]"),
        phone: addPaymentModal.querySelector("[data-add-payment-phone]"),
        tgUser: addPaymentModal.querySelector("[data-add-payment-tg-user]"),
        contract: addPaymentModal.querySelector("[data-add-payment-contract]"),
        house: addPaymentModal.querySelector("[data-add-payment-house]"),
        apartment: addPaymentModal.querySelector("[data-add-payment-apartment]"),
        balanceWrap: addPaymentModal.querySelector("[data-add-payment-balance-wrap]"),
        balance: addPaymentModal.querySelector("[data-add-payment-balance]"),
        balanceIcon: addPaymentModal.querySelector("[data-add-payment-balance-icon]"),
        form: addPaymentModal.querySelector("[data-add-payment-form]"),
        amount: addPaymentModal.querySelector("[data-add-payment-amount]"),
        submit: addPaymentModal.querySelector("[data-add-payment-submit]"),
        operationButtons: Array.from(addPaymentModal.querySelectorAll("[data-add-payment-operation]")),
        channelGroup: addPaymentModal.querySelector("[data-add-payment-channel-group]"),
        channelButtons: Array.from(addPaymentModal.querySelectorAll("[data-add-payment-channel]")),
        submitNote: addPaymentModal.querySelector("[data-add-payment-submit-note]"),
    } : null;
    const addPaymentSearchText = (resident) => normalizeCommandSearch([
        resident?.displayId,
        resident?.name,
        resident?.phone,
        resident?.telegramUser,
        resident?.building,
        resident?.complex,
        resident?.apartment,
        resident?.apartmentNumber,
        resident?.personalAccount,
    ].filter(Boolean).join(" "));
    const addPaymentResidentByOwnerId = (ownerBackendId) => {
        const ownerId = extractOwnerBackendId(ownerBackendId);
        if (!ownerId) return null;
        return addPaymentState.residents.find((resident) => (
            extractOwnerBackendId(resident.ownerBackendId, resident.backendId, resident.id) === ownerId
        )) || null;
    };
    const setAddPaymentStatus = (message = "", kind = "") => {
        if (!addPaymentNodes?.status) return;
        if (!message) {
            addPaymentNodes.status.textContent = "";
            addPaymentNodes.status.classList.add("hidden");
            addPaymentNodes.status.classList.remove("is-error", "is-success");
            return;
        }
        addPaymentNodes.status.textContent = message;
        addPaymentNodes.status.classList.remove("hidden", "is-error", "is-success");
        if (kind === "error") addPaymentNodes.status.classList.add("is-error");
        if (kind === "success") addPaymentNodes.status.classList.add("is-success");
    };
    // The amount is typed by hand (a text field: no spinner, no mouse-wheel changes); "500 000" and
    // "1250,50" are accepted, anything else counts as no amount.
    const addPaymentAmount = () => {
        const raw = String(addPaymentNodes?.amount?.value || "").replace(/\s/g, "").replace(",", ".");
        return /^\d+(\.\d{1,2})?$/.test(raw) ? Number(raw) : 0;
    };
    const syncAddPaymentSubmitState = () => {
        if (!addPaymentNodes?.submit) return;
        const amountValue = addPaymentAmount();
        const channelReady = addPaymentState.operation === "debit" || ["cash", "card", "transfer"].includes(addPaymentState.channel);
        addPaymentNodes.submit.disabled = addPaymentState.submitting || !addPaymentState.selectedResident || !(amountValue > 0) || !channelReady;
    };
    const syncAddPaymentMode = () => {
        if (!addPaymentNodes) return;
        addPaymentNodes.operationButtons.forEach((button) => {
            button.classList.toggle("is-active", button.dataset.addPaymentOperation === addPaymentState.operation);
        });
        addPaymentNodes.channelButtons.forEach((button) => {
            button.classList.toggle("is-active", button.dataset.addPaymentChannel === addPaymentState.channel);
        });
        if (addPaymentNodes.channelGroup) {
            addPaymentNodes.channelGroup.classList.toggle("hidden", addPaymentState.operation !== "credit");
        }
        if (addPaymentNodes.submitNote) {
            addPaymentNodes.submitNote.textContent = addPaymentState.operation === "credit"
                ? t("Payment will be saved and balances will refresh from backend data.")
                : t("Balance subtraction will be saved and totals will refresh from backend data.");
        }
        syncAddPaymentSubmitState();
    };
    const renderAddPaymentResident = (resident) => {
        if (!addPaymentNodes) return;
        addPaymentState.selectedResident = resident || null;
        const hasResident = Boolean(resident);
        addPaymentNodes.residentCard?.classList.toggle("hidden", !hasResident);
        addPaymentNodes.placeholder?.classList.toggle("hidden", hasResident);
        if (!resident) {
            syncAddPaymentSubmitState();
            return;
        }
        const displayId = resident.displayId || extractOwnerBackendId(resident.ownerBackendId, resident.backendId, resident.id) || "--";
        const phone = resident.phone || "--";
        const house = resident.building || "--";
        const apartment = resident.apartmentNumber || resident.apartment || "--";
        const balanceValue = Number(resident.balance || 0);
        const isPositiveBalance = balanceValue >= 0;
        const telegramUser = formatTelegramHandle(resident.telegramUser);
        const hasContract = hasResidentContract(resident);
        const photoUrl = String(resident.photo || "").trim();

        addPaymentNodes.displayId.textContent = String(displayId);
        addPaymentNodes.name.textContent = resident.name || "Resident";
        addPaymentNodes.phone.textContent = phone;
        addPaymentNodes.house.textContent = house;
        addPaymentNodes.apartment.textContent = String(apartment);

        addPaymentNodes.balance.textContent = formatBillingUzs(balanceValue);
        addPaymentNodes.balanceIcon.textContent = isPositiveBalance ? "verified" : "error";
        addPaymentNodes.balanceWrap.classList.toggle("is-positive", isPositiveBalance);
        addPaymentNodes.balanceWrap.classList.toggle("is-negative", !isPositiveBalance);

        addPaymentNodes.tgUser.textContent = telegramHandleText(resident);
        addPaymentNodes.tgUser.classList.toggle("is-connected", Boolean(telegramUser));
        addPaymentNodes.tgUser.classList.toggle("is-missing", !telegramUser);

        addPaymentNodes.contract.textContent = hasContract ? t("True") : t("False");
        addPaymentNodes.contract.classList.toggle("is-contract-true", hasContract);
        addPaymentNodes.contract.classList.toggle("is-contract-false", !hasContract);

        if (photoUrl) {
            addPaymentNodes.photo.src = photoUrl;
            addPaymentNodes.photo.alt = resident.name || "Resident";
            addPaymentNodes.photo.classList.remove("hidden");
            addPaymentNodes.fallback.classList.add("hidden");
        } else {
            addPaymentNodes.photo.classList.add("hidden");
            addPaymentNodes.photo.src = "";
            addPaymentNodes.fallback.classList.remove("hidden");
        }
        syncAddPaymentSubmitState();
    };
    const renderAddPaymentResults = () => {
        if (!addPaymentNodes?.results) return;
        const query = normalizeCommandSearch(addPaymentNodes.search?.value || "");
        const ownerId = extractOwnerBackendId(
            addPaymentState.selectedResident?.ownerBackendId,
            addPaymentState.selectedResident?.backendId,
            addPaymentState.selectedResident?.id
        );
        const filtered = addPaymentState.residents
            .filter((resident) => !query || addPaymentSearchText(resident).includes(query))
            .sort((left, right) => {
                const leftName = String(left?.name || "").toLowerCase();
                const rightName = String(right?.name || "").toLowerCase();
                const leftStarts = Number(leftName.startsWith(query));
                const rightStarts = Number(rightName.startsWith(query));
                if (leftStarts !== rightStarts) return rightStarts - leftStarts;
                return leftName.localeCompare(rightName);
            })
            .slice(0, 10);
        addPaymentNodes.results.innerHTML = filtered.map((resident) => {
            const isPositiveBalance = Number(resident.balance || 0) >= 0;
            const residentOwnerId = extractOwnerBackendId(resident.ownerBackendId, resident.backendId, resident.id);
            const isSelected = ownerId && residentOwnerId === ownerId;
            // The same card as the payment notice search: who, where, which account, the balance.
            const meta = [
                `ID ${residentOwnerId || "-"}`,
                `${t("House")} ${resident.building || "-"}`,
                `${t("Apartment")} ${resident.apartmentNumber || resident.apartment || "-"}`,
                resident.personalAccount ? `${t("Personal account")} ${resident.personalAccount}` : "",
            ].filter(Boolean).join(" · ");
            return `
                <button class="billing-notice-result ${isSelected ? "is-active" : ""}"
                    data-add-payment-select
                    data-owner-backend-id="${escapeAttr(residentOwnerId)}"
                    type="button">
                    <span class="billing-notice-result-icon material-symbols-outlined" aria-hidden="true">person</span>
                    <span class="billing-notice-result-copy">
                        <strong>${escapeHtml(resident.name || "Resident")}</strong>
                        <small>${escapeHtml(meta)}</small>
                    </span>
                    <span class="billing-notice-result-debt ${isPositiveBalance ? "is-positive" : ""}">${escapeHtml(formatBillingUzs(resident.balance || 0))}</span>
                </button>
            `;
        }).join("");
        addPaymentNodes.empty?.classList.toggle("hidden", filtered.length > 0);
        addPaymentNodes.searchClear?.classList.toggle("hidden", !(addPaymentNodes.search?.value || "").trim());
    };
    const syncAddPaymentResidents = () => {
        addPaymentState.residents = (Array.isArray(billingData.residents) ? billingData.residents : []).slice();
    };
    const prepareAddPaymentModal = async (preselectedOwnerId = "") => {
        if (!addPaymentModal || !addPaymentNodes) return;
        addPaymentState.preselectedOwnerId = extractOwnerBackendId(preselectedOwnerId);
        // Every opening starts a fresh operation: cash credit, no amount.
        addPaymentState.operation = "credit";
        addPaymentState.channel = "cash";
        if (addPaymentNodes.amount) addPaymentNodes.amount.value = "";
        setAddPaymentStatus(t("Syncing backend data..."));
        try {
            await refreshPortalDataSnapshot();
        } catch {
            // Existing portal snapshot stays in use when refresh is temporarily unavailable.
        }
        syncAddPaymentResidents();
        const fallbackOwnerId = addPaymentState.preselectedOwnerId
            || extractOwnerBackendId(addPaymentState.selectedResident?.ownerBackendId, addPaymentState.selectedResident?.backendId, addPaymentState.selectedResident?.id);
        renderAddPaymentResident(addPaymentResidentByOwnerId(fallbackOwnerId));
        renderAddPaymentResults();
        setAddPaymentStatus("");
        syncAddPaymentMode();
        // Opened for a resident from their row: the operator only has to type the amount.
        const focusTarget = addPaymentState.preselectedOwnerId && addPaymentState.selectedResident
            ? addPaymentNodes.amount
            : addPaymentNodes.search;
        window.setTimeout(() => focusTarget?.focus(), 0);
    };
    const submitAddPayment = async () => {
        if (!addPaymentNodes || !addPaymentState.selectedResident || addPaymentState.submitting) return;
        const ownerId = extractOwnerBackendId(
            addPaymentState.selectedResident.ownerBackendId,
            addPaymentState.selectedResident.backendId,
            addPaymentState.selectedResident.id
        );
        const amount = addPaymentAmount();
        if (!ownerId) {
            setAddPaymentStatus(t("Resident ID could not be resolved."), "error");
            return;
        }
        if (!(amount > 0)) {
            setAddPaymentStatus(t("Amount must be greater than zero."), "error");
            return;
        }
        addPaymentState.submitting = true;
        syncAddPaymentSubmitState();
        setAddPaymentStatus(t("Saving payment..."));
        try {
            const payload = await postPortalJson("/api/payments/create/", {
                owner_id: ownerId,
                amount,
                operation: addPaymentState.operation,
                channel: addPaymentState.operation === "credit" ? addPaymentState.channel : "",
            });
            rehydrateFromPortalData(payload.portalData);
            syncAddPaymentResidents();
            if (addPaymentNodes.amount) addPaymentNodes.amount.value = "";
            setAddPaymentStatus("");
            playSound("payment-success");
            toast(
                addPaymentState.operation === "credit" ? t("Payment saved") : t("Balance updated"),
                addPaymentState.operation === "credit"
                    ? t({
                        cash: "Cash payment synced with backend.",
                        card: "Card payment synced with backend.",
                        transfer: "Card transfer payment synced with backend.",
                    }[addPaymentState.channel] || "Card payment synced with backend.")
                    : t("Manual subtraction synced with backend."),
                "success"
            );
            // Done: close the window and reload the server-paged tables (residents, transactions),
            // so the new balance shows on the page without a manual refresh.
            closeOverlayById("add-payment-modal");
            window.HydroFlowServerLists?.refreshAll?.();
        } catch (error) {
            setAddPaymentStatus(error.message || "Payment request failed.", "error");
            toast("Payment request failed", error.message || "Backend payment request failed.", "danger");
        } finally {
            addPaymentState.submitting = false;
            syncAddPaymentSubmitState();
        }
    };
    if (addPaymentModal && addPaymentNodes && addPaymentModal.dataset.addPaymentReady !== "true") {
        addPaymentModal.dataset.addPaymentReady = "true";
        addPaymentModal.addEventListener("click", (event) => {
            if (event.target !== addPaymentModal) return;
            closeOverlayById("add-payment-modal");
        });
        addPaymentNodes.search?.addEventListener("input", () => renderAddPaymentResults());
        addPaymentNodes.searchClear?.addEventListener("click", () => {
            if (!addPaymentNodes.search) return;
            addPaymentNodes.search.value = "";
            renderAddPaymentResults();
            addPaymentNodes.search.focus();
        });
        addPaymentNodes.results?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-add-payment-select]");
            if (!button) return;
            const resident = addPaymentResidentByOwnerId(button.dataset.ownerBackendId);
            renderAddPaymentResident(resident);
            renderAddPaymentResults();
            setAddPaymentStatus("");
        });
        addPaymentNodes.amount?.addEventListener("input", () => {
            const cleaned = addPaymentNodes.amount.value.replace(/[^\d.,\s]/g, "");
            if (cleaned !== addPaymentNodes.amount.value) addPaymentNodes.amount.value = cleaned;
            setAddPaymentStatus("");
            syncAddPaymentSubmitState();
        });
        addPaymentNodes.operationButtons.forEach((button) => button.addEventListener("click", () => {
            addPaymentState.operation = button.dataset.addPaymentOperation || "credit";
            setAddPaymentStatus("");
            syncAddPaymentMode();
        }));
        addPaymentNodes.channelButtons.forEach((button) => button.addEventListener("click", () => {
            addPaymentState.channel = button.dataset.addPaymentChannel || "cash";
            setAddPaymentStatus("");
            syncAddPaymentMode();
        }));
        addPaymentNodes.form?.addEventListener("submit", async (event) => {
            event.preventDefault();
            await submitAddPayment();
        });
        addPaymentNodes.search?.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;
            const first = addPaymentNodes.results?.querySelector("[data-add-payment-select]");
            if (!first) return;
            event.preventDefault();
            first.click();
        });
        document.querySelectorAll("[data-modal-open='add-payment-modal']").forEach((button) => button.addEventListener("click", () => {
            window.setTimeout(() => prepareAddPaymentModal(), 0);
        }));
        window.HydroFlowOpenAddPaymentForResident = (ownerBackendId = "") => {
            openOverlayById("add-payment-modal");
            prepareAddPaymentModal(ownerBackendId);
        };
        // "Add payment" in a resident row opens this window for that resident.
        document.addEventListener("click", (event) => {
            const button = event.target.closest("[data-resident-add-payment]");
            if (!button) return;
            const ownerId = extractOwnerBackendId(button.closest("[data-resident-card]")?.dataset.ownerBackendId);
            if (!ownerId) return;
            event.preventDefault();
            event.stopPropagation();
            window.HydroFlowOpenAddPaymentForResident(ownerId);
        });
        syncAddPaymentResidents();
        renderAddPaymentResults();
        renderAddPaymentResident(null);
        syncAddPaymentMode();
    }
    const setActiveCommand = (items, index) => {
        items.forEach((item, itemIndex) => {
            const active = itemIndex === index;
            item.classList.toggle("is-active", active);
            if (active) commandInput?.setAttribute("aria-activedescendant", item.id || "");
        });
    };
    const filterCommands = () => {
        const rawQuery = commandInput?.value.trim() || "";
        const query = normalizeCommandSearch(rawQuery);
        if (!query) {
            renderCommandResults([]);
            commandEmpty?.classList.add("hidden");
            renderRecentCommands();
            return;
        }
        if (rawQuery.length >= 2) {
            saveRecentSearch(rawQuery);
            renderRecentCommands();
        }
        const matches = commandSearchIndex()
            .filter((item) => item.search.includes(query))
            .sort((a, b) => {
                const exactDelta = Number(normalizeCommandSearch(b.title).startsWith(query)) - Number(normalizeCommandSearch(a.title).startsWith(query));
                if (exactDelta) return exactDelta;
                const typeOrder = { resident: 0, apartment: 1, building: 2 };
                return (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9);
            })
            .slice(0, 16);
        renderCommandResults(matches);
        const items = getCommandItems();
        let visible = 0;
        items.forEach((item, index) => {
            if (!item.id) item.id = `command-item-${index}`;
            const show = true;
            item.classList.remove("hidden");
            item.querySelectorAll("[data-command-title], [data-command-meta]").forEach((part) => {
                const original = part.dataset.originalText || part.textContent;
                part.dataset.originalText = original;
                if (!query) {
                    part.textContent = original;
                    return;
                }
                const lower = original.toLowerCase();
                const start = lower.indexOf(query);
                if (start < 0) {
                    part.textContent = original;
                    return;
                }
                part.replaceChildren(
                    document.createTextNode(original.slice(0, start)),
                    Object.assign(document.createElement("mark"), { className: "search-highlight", textContent: original.slice(start, start + query.length) }),
                    document.createTextNode(original.slice(start + query.length))
                );
            });
            if (show) visible += 1;
        });
        const visibleItems = items.filter((item) => !item.classList.contains("hidden"));
        setActiveCommand(visibleItems, visibleItems.length ? 0 : -1);
        commandEmpty?.classList.toggle("hidden", visible > 0);
        const requestId = ++commandSearchRequestId;
        fetchResidentCommandEntries(rawQuery, requestId)
            .then((remoteEntries) => {
                if (requestId !== commandSearchRequestId) return;
                // Server rows must match the query the same way the local ones do.
                const remoteMatches = remoteEntries.filter((item) => item.search.includes(query));
                const merged = mergeCommandEntries([...matches, ...remoteMatches]).slice(0, 16);
                renderCommandResults(merged);
                const refreshedItems = getCommandItems();
                setActiveCommand(refreshedItems, refreshedItems.length ? 0 : -1);
                commandEmpty?.classList.toggle("hidden", refreshedItems.length > 0);
            })
            .catch(() => {
                // Local embedded backend data is kept as fallback when the list endpoint is unavailable.
            });
    };
    const executeCommand = (button) => {
        if (!button) return;
        const queryValue = button.dataset.commandQuery || commandInput?.value || button.querySelector("[data-command-title]")?.textContent || "";
        saveRecentSearch(queryValue);
        saveRecentCommand(button);
        if (button.dataset.commandTargetType === "resident") {
            openResidentCommandProfile(button);
            return;
        }
        if (button.dataset.commandTargetType === "building") {
            storage.setItem("hydroflow-command-query-pending", button.dataset.commandQuery || button.querySelector("[data-command-title]")?.textContent || "");
            window.location.href = "/residential/";
            return;
        }
        if (button.dataset.commandTargetType === "apartment") {
            storage.setItem("hydroflow-command-query-pending", button.dataset.commandQuery || button.querySelector("[data-command-title]")?.textContent || "");
            window.location.href = "/residential/";
            return;
        }
        if (button.dataset.commandUrl) {
            window.location.href = button.dataset.commandUrl;
            return;
        }
        if (button.dataset.commandAction === "toggle-theme") {
            document.querySelector("[data-theme-toggle]")?.click();
            closeCommandPalette({ withWater: false });
            return;
        }
        if (button.dataset.drawerOpen) {
            closeCommandPalette({ withWater: false });
            window.setTimeout(() => {
                document.querySelector(
                    `[data-drawer-open='${button.dataset.drawerOpen}'], [data-modal-open='${button.dataset.drawerOpen}']`
                )?.click();
            }, 0);
            return;
        }
        if (button.hasAttribute("data-export-open")) {
            openExportPreview(button);
            return;
        }
    };
    renderRecentCommands();
    renderCommandResults([]);
    commandInput?.addEventListener("focus", () => {
        renderRecentCommands();
        filterCommands();
    });
    commandInput?.addEventListener("input", debounce(filterCommands, 120));
    commandInput?.addEventListener("keydown", (event) => {
        const items = getCommandItems().filter((item) => !item.classList.contains("hidden"));
        const current = Math.max(0, items.findIndex((item) => item.classList.contains("is-active")));
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const next = event.key === "ArrowDown" ? Math.min(items.length - 1, current + 1) : Math.max(0, current - 1);
            setActiveCommand(items, next);
        }
        if (event.key === "Enter") {
            event.preventDefault();
            const active = items.find((item) => item.classList.contains("is-active")) || items[0];
            active?.click();
        }
    });
    document.addEventListener("click", (event) => {
        const command = event.target.closest("[data-command-results] .command-item");
        if (command) executeCommand(command);
        const recent = event.target.closest("[data-command-recent-query]");
        if (recent) {
            if (!commandInput) return;
            commandInput.value = recent.dataset.commandRecentQuery || "";
            commandInput.dispatchEvent(new Event("input", { bubbles: true }));
            commandInput.focus();
        }
    });
    commandPalette?.addEventListener("click", (event) => {
        if (event.target !== commandPalette) return;
        closeCommandPalette({ withWater: true });
    });

    const exportModal = document.getElementById("export-preview-modal");
    let selectedExportFormat = "XLSX";
    // Debt and payment reports everywhere; the usage report quick action keeps the consumption reports.
    const exportReportSets = { debt: "general", usage: "all" };
    let activeExportReportSet = "debt";
    let selectedExportReportType = exportReportSets.debt;
    let lastExportSource = document.title;
    let lastExportButton = null;
    let lastExportContext = "default";
    const exportBuildingSelect = exportModal?.querySelector("[data-export-building]");
    const exportApartmentSelect = exportModal?.querySelector("[data-export-apartment]");
    const exportResidentSelect = exportModal?.querySelector("[data-export-resident]");
    const exportDateFromInput = exportModal?.querySelector("[data-export-date-from]");
    const exportDateToInput = exportModal?.querySelector("[data-export-date-to]");
    const exportDatePopover = exportModal?.querySelector("[data-export-date-popover]");
    const exportDateDays = exportModal?.querySelector("[data-export-date-days]");
    const exportDateMonthSelect = exportModal?.querySelector("[data-export-date-month-select]");
    const exportDateYearSelect = exportModal?.querySelector("[data-export-date-year-select]");
    const exportDateHour = exportModal?.querySelector("[data-export-date-hour]");
    const exportDateMinute = exportModal?.querySelector("[data-export-date-minute]");
    const exportDateTriggers = Array.from(exportModal?.querySelectorAll("[data-export-date-trigger]") || []);
    const exportDateLabels = {
        from: exportModal?.querySelector("[data-export-date-label='from']"),
        to: exportModal?.querySelector("[data-export-date-label='to']"),
    };
    let activeExportDateTarget = "from";
    let exportDateView = new Date();
    let exportDateDraft = new Date();
    const exportReportTypeButtons = Array.from(exportModal?.querySelectorAll("[data-export-report-type] button") || []);
    const exportText = (key) => translateValue(key, storage.getItem("hydroflow-lang") || "en");
    const exportReportTypeLabel = (reportType) => ({
        general: "Debtors list + payment history",
        debtors: "Debtors list",
        payment_history: "Payment history",
        all: "GVS + Heating + Payments",
        hot_water: "GVS",
        heating: "Heating",
        payments: "Payments",
    }[reportType] || "GVS + Heating + Payments");
    const syncExportSubtitle = () => {
        const subtitle = exportModal?.querySelector("[data-export-subtitle]");
        if (!subtitle) return;
        subtitle.textContent = `${exportText("Source")}: ${exportText(lastExportSource || "Current page")} · ${exportText(exportReportTypeLabel(selectedExportReportType))}`;
    };
    const syncExportReportTypeButtons = () => {
        exportModal?.querySelectorAll("[data-report-set]").forEach((grid) => {
            grid.hidden = grid.dataset.reportSet !== activeExportReportSet;
        });
        exportReportTypeButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.reportType === selectedExportReportType));
    };
    const exportDateTimeLocalValue = (date) => {
        const offsetMs = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
    };
    const parseExportDateValue = (value) => {
        const date = new Date(value || "");
        return Number.isNaN(date.getTime()) ? new Date() : date;
    };
    const formatExportDateLabel = (value) => {
        const date = parseExportDateValue(value);
        return new Intl.DateTimeFormat(storage.getItem("hydroflow-lang") || "en", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };
    const syncExportDateLabels = () => {
        if (exportDateLabels.from && exportDateFromInput?.value) exportDateLabels.from.textContent = formatExportDateLabel(exportDateFromInput.value);
        if (exportDateLabels.to && exportDateToInput?.value) exportDateLabels.to.textContent = formatExportDateLabel(exportDateToInput.value);
    };
    const exportDateInputForTarget = (target) => target === "to" ? exportDateToInput : exportDateFromInput;
    const renderExportDatePicker = () => {
        if (!exportDatePopover || !exportDateDays || !exportDateMonthSelect || !exportDateYearSelect || !exportDateHour || !exportDateMinute) return;
        const locale = storage.getItem("hydroflow-lang") || "en";
        exportDateMonthSelect.innerHTML = Array.from({ length: 12 }, (_, month) => {
            const label = new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(exportDateView.getFullYear(), month, 1));
            return `<option value="${month}">${escapeHtml(label)}</option>`;
        }).join("");
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 6;
        exportDateYearSelect.innerHTML = Array.from({ length: 13 }, (_, index) => {
            const year = startYear + index;
            return `<option value="${year}">${year}</option>`;
        }).join("");
        exportDateMonthSelect.value = String(exportDateView.getMonth());
        exportDateYearSelect.value = String(exportDateView.getFullYear());
        exportDateHour.innerHTML = Array.from({ length: 24 }, (_, hour) => `<option value="${hour}">${String(hour).padStart(2, "0")}</option>`).join("");
        exportDateMinute.innerHTML = Array.from({ length: 60 }, (_, minute) => `<option value="${minute}">${String(minute).padStart(2, "0")}</option>`).join("");
        exportDateHour.value = String(exportDateDraft.getHours());
        exportDateMinute.value = String(exportDateDraft.getMinutes());

        const firstOfMonth = new Date(exportDateView.getFullYear(), exportDateView.getMonth(), 1);
        const startOffset = (firstOfMonth.getDay() + 6) % 7;
        const gridStart = new Date(firstOfMonth);
        gridStart.setDate(firstOfMonth.getDate() - startOffset);
        const todayValue = new Date().toDateString();
        const selectedValue = exportDateDraft.toDateString();
        exportDateDays.innerHTML = Array.from({ length: 42 }, (_, index) => {
            const date = new Date(gridStart);
            date.setDate(gridStart.getDate() + index);
            const classes = ["export-date-day"];
            if (date.getMonth() !== exportDateView.getMonth()) classes.push("is-muted");
            if (date.toDateString() === todayValue) classes.push("is-today");
            if (date.toDateString() === selectedValue) classes.push("is-selected");
            return `<button class="${classes.join(" ")}" data-export-date-day="${date.toISOString()}" type="button">${date.getDate()}</button>`;
        }).join("");
    };
    const openExportDatePicker = (target) => {
        const input = exportDateInputForTarget(target);
        activeExportDateTarget = target;
        exportDateDraft = parseExportDateValue(input?.value);
        exportDateView = new Date(exportDateDraft.getFullYear(), exportDateDraft.getMonth(), 1);
        exportDateTriggers.forEach((button) => button.classList.toggle("is-active", button.dataset.exportDateTrigger === target));
        renderExportDatePicker();
        playExportDateOpenSound();
        exportDatePopover?.classList.remove("hidden");
    };
    const closeExportDatePicker = () => {
        exportDatePopover?.classList.add("hidden");
        exportDateTriggers.forEach((button) => button.classList.remove("is-active"));
    };
    const playExportDateOpenSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const context = new AudioContext();
            const gain = context.createGain();
            const first = context.createOscillator();
            const second = context.createOscillator();
            gain.gain.setValueAtTime(0.0001, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
            first.frequency.setValueAtTime(740, context.currentTime);
            first.frequency.exponentialRampToValueAtTime(920, context.currentTime + 0.12);
            second.frequency.setValueAtTime(1180, context.currentTime + 0.035);
            first.type = "sine";
            second.type = "triangle";
            first.connect(gain);
            second.connect(gain);
            gain.connect(context.destination);
            first.start(context.currentTime);
            second.start(context.currentTime + 0.035);
            first.stop(context.currentTime + 0.16);
            second.stop(context.currentTime + 0.18);
            window.setTimeout(() => context.close?.(), 260);
        } catch (error) {
            // Sound is optional; blocked audio should not affect the date picker.
        }
    };
    const applyExportDateDraft = () => {
        const input = exportDateInputForTarget(activeExportDateTarget);
        if (!input) return;
        exportDateDraft.setHours(Number(exportDateHour?.value || 0), Number(exportDateMinute?.value || 0), 0, 0);
        input.value = exportDateTimeLocalValue(exportDateDraft);
        syncExportDateLabels();
        closeExportDatePicker();
    };
    const setExportSelectOptions = (select, rows, emptyLabel) => {
        if (!select) return;
        const previous = select.value;
        select.innerHTML = [`<option value="">${escapeHtml(exportText(emptyLabel))}</option>`, ...rows.map((row) => (
            `<option value="${escapeHtml(row.value)}">${escapeHtml(row.label)}</option>`
        ))].join("");
        const canRestore = previous && rows.some((row) => String(row.value) === String(previous));
        select.value = canRestore ? previous : "";
    };
    const getExportResidentPool = () => (Array.isArray(billingData.residents) ? billingData.residents : [])
        .filter((resident) => resident?.ownerBackendId || resident?.backendId)
        .map((resident) => ({
            ownerId: String(resident.ownerBackendId || resident.backendId || ""),
            apartmentId: String(resident.apartmentBackendId || ""),
            buildingId: String(resident.buildingBackendId || ""),
            name: resident.name || "Resident",
            building: resident.building || "",
            apartment: resident.apartmentNumber || resident.apartment || "",
            phone: resident.phone || "",
        }));
    const syncExportFilters = () => {
        const pool = getExportResidentPool();
        const buildingOptions = Array.from(new Map(pool
            .filter((item) => item.buildingId)
            .map((item) => [item.buildingId, { value: item.buildingId, label: item.building || `House ${item.buildingId}` }])).values())
            .sort((a, b) => a.label.localeCompare(b.label));
        setExportSelectOptions(exportBuildingSelect, buildingOptions, "All houses");

        const buildingId = exportBuildingSelect?.value || "";
        const apartmentPool = pool.filter((item) => !buildingId || item.buildingId === buildingId);
        const apartmentOptions = Array.from(new Map(apartmentPool
            .filter((item) => item.apartmentId)
            .map((item) => [item.apartmentId, {
                value: item.apartmentId,
                label: [item.apartment, item.building].filter(Boolean).join(" · ") || `Apartment ${item.apartmentId}`,
            }])).values())
            .sort((a, b) => a.label.localeCompare(b.label));
        setExportSelectOptions(exportApartmentSelect, apartmentOptions, "All apartments");

        const apartmentId = exportApartmentSelect?.value || "";
        const residentPool = apartmentPool.filter((item) => !apartmentId || item.apartmentId === apartmentId);
        const residentOptions = residentPool
            .map((item) => ({
                value: item.ownerId,
                label: [item.name, item.building, item.apartment].filter(Boolean).join(" · "),
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
        setExportSelectOptions(exportResidentSelect, residentOptions, "All residents");
    };
    const resetExportFilters = () => {
        if (exportBuildingSelect) exportBuildingSelect.value = "";
        if (exportApartmentSelect) exportApartmentSelect.value = "";
        if (exportResidentSelect) exportResidentSelect.value = "";
        if (exportDateFromInput) exportDateFromInput.value = exportDateTimeLocalValue(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
        if (exportDateToInput) exportDateToInput.value = exportDateTimeLocalValue(new Date());
        syncExportDateLabels();
        closeExportDatePicker();
        selectedExportReportType = exportReportSets[activeExportReportSet];
        syncExportReportTypeButtons();
        syncExportFilters();
    };
    const applyExportContextFromButton = (sourceButton = null) => {
        const host = sourceButton?.closest("#details-drawer, #apartment-details-drawer");
        if (!host) return;
        const buildingId = String(host.dataset.buildingBackendId || "");
        const apartmentId = String(host.dataset.apartmentBackendId || "");
        const ownerId = String(host.dataset.ownerBackendId || "");
        if (exportBuildingSelect && buildingId) exportBuildingSelect.value = buildingId;
        syncExportFilters();
        if (exportApartmentSelect && apartmentId) exportApartmentSelect.value = apartmentId;
        syncExportFilters();
        if (exportResidentSelect && ownerId) exportResidentSelect.value = ownerId;
        syncExportFilters();
    };
    const getEffectiveExportContext = (baseContext) => {
        const forcedScopedContext = Boolean(exportResidentSelect?.value || exportApartmentSelect?.value || exportBuildingSelect?.value);
        if (forcedScopedContext) return "transactions";
        if (["usage-report", "billing", "transactions", "debt-letters"].includes(baseContext)) return "transactions";
        if (baseContext === "default") return "residential";
        return baseContext;
    };
    const getExportHostFromButton = (sourceButton = null) => {
        if (!sourceButton) return document;
        if (sourceButton.matches("[data-table-action]")) {
            const tools = sourceButton.closest(".table-tools");
            const host = tools?.nextElementSibling;
            if (host?.matches(".table-workspace, table, .overflow-x-auto")) return host;
        }
        const sectionCard = sourceButton.closest(".bg-surface-container-lowest, section, .table-workspace");
        return sectionCard || document;
    };
    const detectExportContext = (sourceButton = null) => {
        if (sourceButton?.dataset.exportContext) return sourceButton.dataset.exportContext;
        const host = getExportHostFromButton(sourceButton);
        const scope = host === document ? sourceButton?.closest(".bg-surface-container-lowest, section, div") : host.parentElement || host;
        const title = scope?.querySelector("h3,h4")?.textContent?.trim().toLowerCase() || "";
        if (title.includes("recent transaction log") || title.includes("transaction") || title.includes("транзак") || title.includes("платеж") || title.includes("to'lov")) return "transactions";
        if (title.includes("complex performance") || title.includes("residential") || title.includes("жил") || title.includes("комплекс")) return "residential";
        if (window.location.pathname.toLowerCase().includes("/billing")) return "billing";
        if (window.location.pathname.toLowerCase().includes("/residential")) return "residential";
        return "default";
    };
    const getExportSourceFromButton = (sourceButton = null) => {
        if (sourceButton?.dataset.exportSource) return sourceButton.dataset.exportSource;
        const host = getExportHostFromButton(sourceButton);
        const titleScope = host === document ? sourceButton?.closest(".bg-surface-container-lowest, section, div") : host.parentElement || host;
        return titleScope?.querySelector("h3,h4")?.textContent?.trim() || document.title;
    };
    const exportLang = () => storage.getItem("hydroflow-lang") || "en";
    const downloadBlob = (content, type, filename) => {
        const blob = new Blob([content], { type });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    };
    const openExportPreview = (sourceButton = null) => {
        lastExportButton = sourceButton;
        lastExportContext = detectExportContext(sourceButton);
        const source = getExportSourceFromButton(sourceButton);
        lastExportSource = source;
        const isUsageReport = lastExportContext === "usage-report" || source.toLowerCase().includes("usage report");
        activeExportReportSet = isUsageReport ? "usage" : "debt";
        resetExportFilters();
        applyExportContextFromButton(sourceButton);
        document.querySelectorAll("[data-export-format] button").forEach((item) => item.classList.toggle("is-active", (item.dataset.format || "XLSX") === selectedExportFormat));
        syncExportSubtitle();
        openOverlayById("export-preview-modal");
    };
    document.querySelectorAll("[data-export-format] button").forEach((button) => button.addEventListener("click", () => {
        const requestedFormat = button.dataset.format || "XLSX";
        selectedExportFormat = requestedFormat;
        document.querySelectorAll("[data-export-format] button").forEach((item) => item.classList.toggle("is-active", (item.dataset.format || "XLSX") === selectedExportFormat));
    }));
    exportReportTypeButtons.forEach((button) => button.addEventListener("click", () => {
        selectedExportReportType = button.dataset.reportType || exportReportSets[activeExportReportSet];
        syncExportReportTypeButtons();
        syncExportSubtitle();
    }));
    document.addEventListener("click", (event) => {
        const exportButton = event.target.closest("[data-export-open], [data-table-action='export']");
        if (!exportButton) return;
        event.preventDefault();
        openExportPreview(exportButton);
    }, true);
    exportBuildingSelect?.addEventListener("change", () => syncExportFilters());
    exportApartmentSelect?.addEventListener("change", () => syncExportFilters());
    exportResidentSelect?.addEventListener("change", () => {
        const pool = getExportResidentPool();
        const resident = pool.find((item) => String(item.ownerId) === String(exportResidentSelect.value || ""));
        if (!resident) return;
        if (exportBuildingSelect) exportBuildingSelect.value = resident.buildingId;
        syncExportFilters();
        if (exportApartmentSelect) exportApartmentSelect.value = resident.apartmentId;
        syncExportFilters();
        if (exportResidentSelect) exportResidentSelect.value = resident.ownerId;
    });
    exportDateTriggers.forEach((button) => button.addEventListener("click", () => openExportDatePicker(button.dataset.exportDateTrigger || "from")));
    exportDatePopover?.querySelectorAll("[data-export-date-nav]").forEach((button) => button.addEventListener("click", () => {
        exportDateView = new Date(exportDateView.getFullYear(), exportDateView.getMonth() + Number(button.dataset.exportDateNav || 0), 1);
        renderExportDatePicker();
    }));
    exportDateMonthSelect?.addEventListener("change", () => {
        exportDateView = new Date(exportDateView.getFullYear(), Number(exportDateMonthSelect.value || 0), 1);
        renderExportDatePicker();
    });
    exportDateYearSelect?.addEventListener("change", () => {
        exportDateView = new Date(Number(exportDateYearSelect.value || exportDateView.getFullYear()), exportDateView.getMonth(), 1);
        renderExportDatePicker();
    });
    exportDateDays?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-export-date-day]");
        if (!button) return;
        const selected = new Date(button.dataset.exportDateDay || "");
        if (Number.isNaN(selected.getTime())) return;
        exportDateDraft = new Date(
            selected.getFullYear(),
            selected.getMonth(),
            selected.getDate(),
            Number(exportDateHour?.value || exportDateDraft.getHours()),
            Number(exportDateMinute?.value || exportDateDraft.getMinutes()),
            0,
            0,
        );
        exportDateView = new Date(exportDateDraft.getFullYear(), exportDateDraft.getMonth(), 1);
        renderExportDatePicker();
    });
    exportDateHour?.addEventListener("change", () => {
        exportDateDraft.setHours(Number(exportDateHour.value || 0));
    });
    exportDateMinute?.addEventListener("change", () => {
        exportDateDraft.setMinutes(Number(exportDateMinute.value || 0));
    });
    exportModal?.querySelector("[data-export-date-today]")?.addEventListener("click", () => {
        exportDateDraft = new Date();
        exportDateView = new Date(exportDateDraft.getFullYear(), exportDateDraft.getMonth(), 1);
        renderExportDatePicker();
    });
    exportModal?.querySelector("[data-export-date-apply]")?.addEventListener("click", () => applyExportDateDraft());
    exportModal?.querySelector("[data-export-date-close]")?.addEventListener("click", () => closeExportDatePicker());
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !exportDatePopover || exportDatePopover.classList.contains("hidden")) return;
        closeExportDatePicker();
    });
    document.addEventListener("click", (event) => {
        if (!exportModal || !exportDatePopover || exportDatePopover.classList.contains("hidden")) return;
        if (event.target.closest("[data-export-date-popover], [data-export-date-trigger]")) return;
        closeExportDatePicker();
    }, true);
    document.querySelector("[data-export-reset]")?.addEventListener("click", () => resetExportFilters());
    document.addEventListener("hydroflow:backend-refreshed", () => syncExportFilters());
    document.addEventListener("hydroflow:language-changed", () => syncExportFilters());
    resetExportFilters();
    document.addEventListener("click", (event) => {
        const viewDebtors = event.target.closest("[data-view-debtors]");
        if (viewDebtors) {
            event.preventDefault();
            storage.setItem("hydroflow-requested-billing-filter", "debtors");
            toast("Debtors view ready", "Opening Billing & Debt with current debtor data.", "info");
            window.setTimeout(() => {
                window.location.href = "/billing/";
            }, 120);
            return;
        }
        const viewActivities = event.target.closest("[data-view-activities]");
        if (viewActivities) {
            event.preventDefault();
            const auditTrigger = document.querySelector("[data-drawer-open='audit-drawer']");
            if (auditTrigger) {
                auditTrigger.click();
            } else {
                toast("Activity timeline", "Audit log is available from the account menu.", "info");
            }
        }
    }, true);
    const triggerDownloadPayload = (download) => {
        if (!download?.content) return;
        const binary = window.atob(download.content);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        downloadBlob(bytes, download.mime || "application/octet-stream", download.filename || "hydroflow-export.dat");
    };
    const buildBackendExportSelection = (context) => {
        const selection = {
            context,
            lang: storage.getItem("hydroflow-lang") || "en",
            owner_ids: [],
            complex_backend_ids: [],
            building_backend_ids: [],
            apartment_backend_ids: [],
            transaction_backend_ids: [],
            date_from: exportDateFromInput?.value || "",
            date_to: exportDateToInput?.value || "",
        };
        if (exportResidentSelect?.value) selection.owner_ids = [Number(exportResidentSelect.value)];
        if (exportApartmentSelect?.value) selection.apartment_backend_ids = [Number(exportApartmentSelect.value)];
        if (exportBuildingSelect?.value) selection.building_backend_ids = [Number(exportBuildingSelect.value)];
        const detailsHost = lastExportButton?.closest("#details-drawer");
        if (detailsHost) {
            const ownerId = Number(detailsHost.dataset.ownerBackendId || 0);
            const apartmentId = Number(detailsHost.dataset.apartmentBackendId || 0);
            const buildingId = Number(detailsHost.dataset.buildingBackendId || 0);
            const complexId = Number(detailsHost.dataset.complexBackendId || 0);
            const alertId = Number(detailsHost.dataset.alertBackendId || 0);
            if (ownerId && !selection.owner_ids.length) selection.owner_ids = [ownerId];
            if (apartmentId && !selection.apartment_backend_ids.length) selection.apartment_backend_ids = [apartmentId];
            if (buildingId && !selection.building_backend_ids.length) selection.building_backend_ids = [buildingId];
            if (complexId && !selection.complex_backend_ids.length) selection.complex_backend_ids = [complexId];
            if (context === "transactions" && alertId) selection.source_alert_id = alertId;
            return selection;
        }
        const apartmentHost = lastExportButton?.closest("#apartment-details-drawer");
        if (apartmentHost) {
            const ownerId = Number(apartmentHost.dataset.ownerBackendId || 0);
            const apartmentId = Number(apartmentHost.dataset.apartmentBackendId || 0);
            const buildingId = Number(apartmentHost.dataset.buildingBackendId || 0);
            const complexId = Number(apartmentHost.dataset.complexBackendId || 0);
            if (ownerId && !selection.owner_ids.length) selection.owner_ids = [ownerId];
            if (apartmentId && !selection.apartment_backend_ids.length) selection.apartment_backend_ids = [apartmentId];
            if (buildingId && !selection.building_backend_ids.length) selection.building_backend_ids = [buildingId];
            if (complexId && !selection.complex_backend_ids.length) selection.complex_backend_ids = [complexId];
            return selection;
        }
        if (context === "transactions") {
            if (!selection.owner_ids.length && !selection.apartment_backend_ids.length && !selection.building_backend_ids.length) {
                selection.transaction_backend_ids = Array.from(document.querySelectorAll("[data-transaction-id]:not(.hidden)"))
                    .map((row) => Number(row.dataset.backendId || 0))
                    .filter(Boolean);
            }
            return selection;
        }
        // On the houses page the window's House/Apartment/Resident fields alone set the scope: no house
        // chosen means every house, whatever rows are expanded on the page.
        return selection;
    };
    document.querySelector("[data-export-download]")?.addEventListener("click", async () => {
        try {
            const effectiveContext = getEffectiveExportContext(lastExportContext || "default");
            const payload = await postPortalJson("/api/export/report/", {
                ...buildBackendExportSelection(effectiveContext),
                context: effectiveContext,
                format: selectedExportFormat,
                report_type: selectedExportReportType,
                source: lastExportSource || "Current page",
                language: exportLang(),
            });
            triggerDownloadPayload(payload.download);
            rehydrateFromPortalData(payload.portalData);
            toast(exportText("Download ready"), `${exportText(exportReportTypeLabel(selectedExportReportType))} · ${selectedExportFormat}`, "success");
        } catch (error) {
            toast(exportText("Export failed"), error.message || exportText("Backend export failed."), "warning");
        }
    });
    // The apartment window's Export: the apartment account's whole balance history as Excel.
    document.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-apartment-history-export]");
        if (!button) return;
        event.preventDefault();
        const apartmentId = Number(button.closest("#apartment-details-drawer")?.dataset.apartmentBackendId || 0);
        if (!apartmentId || button.disabled) return;
        button.disabled = true;
        try {
            const payload = await postPortalJson("/api/export/report/", {
                report_type: "account_history",
                format: "XLSX",
                apartment_backend_ids: [apartmentId],
                source: "Apartment balance history",
                language: exportLang(),
            });
            triggerDownloadPayload(payload.download);
            toast(exportText("Download ready"), exportText("Balance history was saved as Excel."), "success");
        } catch (error) {
            toast(exportText("Export failed"), error.message || exportText("Backend export failed."), "warning");
        } finally {
            button.disabled = false;
        }
    });
    const assignStatusModal = document.getElementById("assign-status-modal");
    const assignStatusOptionsRoot = assignStatusModal?.querySelector("[data-assign-status-options]");
    const assignStatusSummary = assignStatusModal?.querySelector("[data-assign-status-summary]");
    const assignStatusTarget = assignStatusModal?.querySelector("[data-assign-status-target]");
    const assignStatusNote = assignStatusModal?.querySelector("[data-assign-status-note]");
    const assignStatusApply = assignStatusModal?.querySelector("[data-assign-status-apply]");
    let pendingStatusAssignment = { rows: [], button: null, context: "default", value: "" };
    const statusLabel = (labels) => labels?.[exportLang()] || labels?.en || "";
    const assignStatusCatalog = {
        residential: [
            { value: "Low Risk", tone: "success", icon: "verified", label: { en: "Low risk", ru: "Низкий риск", uz: "Past xavf" }, note: { en: "Debt and operations are under control.", ru: "Долг и операции под контролем.", uz: "Qarz va ishlar nazoratda." } },
            { value: "Medium Risk", tone: "warning", icon: "monitoring", label: { en: "Medium risk", ru: "Средний риск", uz: "O'rta xavf" }, note: { en: "Needs monitoring before escalation.", ru: "Нужно наблюдение до эскалации.", uz: "Eskalatsiyagacha kuzatuv kerak." } },
            { value: "Critical", tone: "critical", icon: "priority_high", label: { en: "Critical", ru: "Критично", uz: "Kritik" }, note: { en: "Requires immediate action.", ru: "Требует немедленного действия.", uz: "Darhol chora kerak." } },
            { value: "Review", tone: "info", icon: "fact_check", label: { en: "Review", ru: "Проверка", uz: "Tekshiruv" }, note: { en: "Hold for manual review.", ru: "Оставить на ручную проверку.", uz: "Qo'lda tekshirish uchun qoldiring." } },
        ],
        transactions: [
            { value: "Success", tone: "success", icon: "check_circle", label: { en: "Success", ru: "Успешно", uz: "Muvaffaqiyatli" }, note: { en: "Payment is confirmed.", ru: "Платёж подтверждён.", uz: "To'lov tasdiqlandi." } },
            { value: "Pending", tone: "warning", icon: "schedule", label: { en: "Pending", ru: "Ожидает", uz: "Kutilmoqda" }, note: { en: "Awaiting settlement.", ru: "Ожидает обработки.", uz: "Hisob-kitob kutilmoqda." } },
            { value: "Review", tone: "info", icon: "manage_search", label: { en: "Review", ru: "Проверка", uz: "Tekshiruv" }, note: { en: "Needs finance review.", ru: "Нужна проверка финансов.", uz: "Moliya tekshiruvi kerak." } },
            { value: "Failed", tone: "critical", icon: "error", label: { en: "Failed", ru: "Ошибка", uz: "Xato" }, note: { en: "Payment did not complete.", ru: "Платёж не завершён.", uz: "To'lov yakunlanmadi." } },
        ],
        default: [
            { value: "Operational", tone: "success", icon: "verified", label: { en: "Operational", ru: "Работает", uz: "Ishlayapti" }, note: { en: "Normal operating state.", ru: "Нормальное рабочее состояние.", uz: "Normal ish holati." } },
            { value: "Maintenance", tone: "warning", icon: "build", label: { en: "Maintenance", ru: "Обслуживание", uz: "Xizmat" }, note: { en: "Requires service attention.", ru: "Требует обслуживания.", uz: "Xizmat e'tibori kerak." } },
            { value: "Review", tone: "info", icon: "fact_check", label: { en: "Review", ru: "Проверка", uz: "Tekshiruv" }, note: { en: "Needs manual confirmation.", ru: "Нужно ручное подтверждение.", uz: "Qo'lda tasdiqlash kerak." } },
        ],
    };
    const getRowsForStatusAction = (button) => {
        const workspace = button.closest(".table-tools")?.nextElementSibling;
        if (!workspace) return [];
        return Array.from(workspace.querySelectorAll("tbody tr")).filter((row) => !row.classList.contains("hidden"));
    };
    const getStatusColumnIndex = (button) => {
        const workspace = button.closest(".table-tools")?.nextElementSibling;
        const table = workspace?.matches("table") ? workspace : workspace?.querySelector("table");
        const headers = Array.from(table?.querySelectorAll("thead th") || []).filter((cell) => !cell.querySelector("[data-select-all]"));
        const labels = headers.map((cell) => cell.textContent.trim().toLowerCase());
        const exact = labels.findIndex((label) => label === "status" || label === "статус" || label === "holat");
        if (exact >= 0) return exact;
        const debt = labels.findIndex((label) => label.includes("debt status") || label.includes("статус долга") || label.includes("risk"));
        if (debt >= 0) return debt;
        const broad = labels.findIndex((label) => label.includes("status") || label.includes("статус") || label.includes("holat"));
        if (broad >= 0) return broad;
        return Math.max(0, labels.length - 2);
    };
    const statusSelectionForRow = (row, context) => {
        if (context === "residential") {
            const targetType = row.dataset.backendType || (row.dataset.drillRow === "district" ? "complex" : row.dataset.drillRow);
            const targetId = Number(row.dataset.backendId || 0);
            return targetId ? { target_type: targetType, target_id: targetId } : null;
        }
        if (context === "transactions") {
            const targetId = Number(row.dataset.backendId || 0);
            return targetId ? { target_type: "transaction", target_id: targetId } : null;
        }
        return null;
    };
    const setAssignStatusSelection = (value) => {
        pendingStatusAssignment.value = value;
        assignStatusOptionsRoot?.querySelectorAll("[data-assign-status-option]").forEach((button) => {
            button.classList.toggle("is-selected", button.dataset.assignStatusOption === value);
        });
        const option = (assignStatusCatalog[pendingStatusAssignment.context] || assignStatusCatalog.default).find((item) => item.value === value);
        if (assignStatusNote && option?.note) assignStatusNote.textContent = statusLabel(option.note);
    };
    const renderAssignStatusOptions = (context) => {
        const options = assignStatusCatalog[context] || assignStatusCatalog.default;
        if (!assignStatusOptionsRoot) return;
        assignStatusOptionsRoot.innerHTML = options.map((option) => `
            <button class="assign-status-option is-${option.tone}" data-assign-status-option="${option.value}" type="button">
                <span class="material-symbols-outlined">${option.icon}</span>
                <span>
                    <strong>${statusLabel(option.label)}</strong>
                    <small>${statusLabel(option.note)}</small>
                </span>
            </button>
        `).join("");
        setAssignStatusSelection(options[0]?.value || "");
    };
    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-table-action='status']");
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        const rows = getRowsForStatusAction(button);
        const selectedRows = rows.filter((row) => row.querySelector("[data-row-select]:checked"));
        if (!selectedRows.length) {
            toast("Select rows first", "Choose one or more rows before assigning status.", "warning");
            return;
        }
        const context = detectExportContext(button);
        pendingStatusAssignment = { rows: selectedRows, button, context, value: "" };
        renderAssignStatusOptions(context);
        if (assignStatusSummary) assignStatusSummary.textContent = `${selectedRows.length} selected rows will be updated in backend.`;
        if (assignStatusTarget) assignStatusTarget.textContent = {
            transactions: "Recent Transaction Log",
            residential: "Complex Performance Overview",
            billing: "Billing table",
            default: "Current table",
        }[context] || "Current table";
        openOverlayById("assign-status-modal");
    }, true);
    assignStatusOptionsRoot?.addEventListener("click", (event) => {
        const option = event.target.closest("[data-assign-status-option]");
        if (!option) return;
        setAssignStatusSelection(option.dataset.assignStatusOption || "");
    });
    assignStatusApply?.addEventListener("click", async () => {
        const options = assignStatusCatalog[pendingStatusAssignment.context] || assignStatusCatalog.default;
        const option = options.find((item) => item.value === pendingStatusAssignment.value);
        if (!option || !pendingStatusAssignment.rows.length || !pendingStatusAssignment.button) {
            toast("Select rows first", "Choose one or more rows before assigning status.", "warning");
            return;
        }
        const selected = pendingStatusAssignment.rows
            .map((row) => statusSelectionForRow(row, pendingStatusAssignment.context))
            .filter(Boolean);
        if (!selected.length) {
            toast("Rows are not linked", "Selected rows do not have backend identifiers.", "warning");
            return;
        }
        const statusIndex = getStatusColumnIndex(pendingStatusAssignment.button);
        try {
            const payload = await postPortalJson("/api/status/assign/", {
                context: pendingStatusAssignment.context,
                status: option.value,
                selected,
            });
            rehydrateFromPortalData(payload.portalData);
            pendingStatusAssignment.rows.forEach((row) => {
                const checkbox = row.querySelector("[data-row-select]");
                if (!checkbox) return;
                checkbox.checked = false;
                checkbox.dispatchEvent(new Event("change", { bubbles: true }));
            });
            const selectAll = pendingStatusAssignment.button.closest(".table-tools")?.nextElementSibling?.querySelector("[data-select-all]");
            if (selectAll) {
                selectAll.checked = false;
                selectAll.dispatchEvent(new Event("change", { bubbles: true }));
            }
            closeOverlayById("assign-status-modal");
            toast("Status assigned", `${statusLabel(option.label)} applied to ${payload.updated || selected.length} rows.`, "success");
            pendingStatusAssignment = { rows: [], button: null, context: "default", value: "" };
        } catch (error) {
            toast("Status update failed", error.message || "Backend status update failed.", "warning");
        }
    });

    const updateTableEmptyStates = () => {
        document.querySelectorAll(".table-workspace").forEach((host) => {
            const rows = Array.from(host.querySelectorAll("tbody tr"));
            const visible = rows.filter((row) => !row.classList.contains("hidden")).length;
            let state = host.querySelector("[data-table-empty-state]");
            if (!state) {
                state = document.createElement("div");
                state.className = "table-empty-state hidden";
                state.dataset.tableEmptyState = "true";
                host.appendChild(state);
            }
            state.innerHTML = `<span class="material-symbols-outlined">search_off</span><strong>${escapeHtml(t("No transactions for selected filters"))}</strong><small>${escapeHtml(t("Try another search term or reset filters. Backend data will refresh on retry."))}</small><button type="button" data-table-empty-reset>${escapeHtml(t("Retry"))}</button>`;
            state.classList.toggle("hidden", visible > 0 || rows.length === 0);
        });
    };
    const clearHighlights = (rootElement) => {
        rootElement.querySelectorAll("mark.search-highlight").forEach((mark) => mark.replaceWith(document.createTextNode(mark.textContent)));
    };
    const highlightText = (element, query) => {
        if (!query || element.children.length) return;
        const text = element.textContent;
        const index = text.toLowerCase().indexOf(query);
        if (index < 0) return;
        element.replaceChildren(
            document.createTextNode(text.slice(0, index)),
            Object.assign(document.createElement("mark"), { className: "search-highlight", textContent: text.slice(index, index + query.length) }),
            document.createTextNode(text.slice(index + query.length))
        );
    };
    document.addEventListener("input", (event) => {
        const input = event.target.closest(".table-search, [data-resident-search], [data-command-input]");
        if (!input) return;
        const query = input.value.trim().toLowerCase();
        if (input.classList.contains("table-search")) {
            const workspace = input.closest(".table-tools")?.nextElementSibling;
            window.setTimeout(() => {
                updateTableEmptyStates();
                if (workspace) {
                    clearHighlights(workspace);
                    if (query) workspace.querySelectorAll("td, p, span").forEach((item) => highlightText(item, query));
                }
            }, 280);
        }
        if (input.matches("[data-resident-search]")) {
            document.querySelectorAll("[data-resident-card]").forEach((card) => {
                card.classList.toggle("search-match-card", Boolean(query) && card.textContent.toLowerCase().includes(query));
            });
        }
        const value = input.value.trim();
        if (value) saveRecentSearch(value);
    }, true);
    document.addEventListener("click", (event) => {
        const reset = event.target.closest("[data-table-empty-reset]");
        if (!reset) return;
        const workspace = reset.closest(".table-workspace");
        const search = workspace?.previousElementSibling?.querySelector(".table-search");
        if (search) {
            search.value = "";
            search.dispatchEvent(new Event("input", { bubbles: true }));
            search.focus();
        }
    });
    window.setTimeout(updateTableEmptyStates, 0);
    document.addEventListener("hydroflow:language-changed", () => window.setTimeout(updateTableEmptyStates, 0));

    document.addEventListener("keydown", (event) => {
        if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
        const tag = document.activeElement?.tagName;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
        event.preventDefault();
        const input = document.querySelector("[data-command-open], [data-resident-search], .table-search");
        input?.focus();
    });

    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-notification-pin]");
        if (!button) return;
        event.stopPropagation();
        const item = button.closest(".notification-item");
        if (!item) return;
        const pinned = item.dataset.pinned !== "true";
        const current = getPinnedNotificationIds().filter((id) => id !== item.dataset.notificationId);
        savePinnedNotificationIds(pinned ? [item.dataset.notificationId, ...current] : current);
        setNotificationPinnedState(item, pinned);
        updateNotifications();
        toast(pinned ? "Notification pinned" : "Notification unpinned", item.querySelector("p.text-sm")?.textContent || "", "info");
    });
    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-notification-resolve]");
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        const item = button.closest(".notification-item");
        button.disabled = true;
        button.classList.add("is-loading");
        resolveNotificationItem(item)
            .then(() => {
                const lang = storage.getItem("hydroflow-lang") || "en";
                toast(translateValue("Alert closed", lang), "The notification was moved to the audit timeline.", "success");
            })
            .catch((error) => {
                button.disabled = false;
                button.classList.remove("is-loading");
                const lang = storage.getItem("hydroflow-lang") || "en";
                toast(translateValue("Alert closed", lang), error.message || "The notification could not be resolved.", "warning");
            });
    });
    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-notification-action]");
        if (!button) return;
        const item = button.closest(".notification-item");
        const state = item?.querySelector("[data-notification-state]");
        if (state) {
            state.textContent = button.dataset.notificationAction || "Action updated";
            state.classList.remove("hidden");
        }
        if (item) item.dataset.read = "true";
        updateNotifications();
    });
    const renderBackendAuditEvents = () => {
        const timeline = document.querySelector("[data-audit-timeline]");
        const events = Array.isArray(billingData.auditEvents) ? billingData.auditEvents : [];
        if (!timeline) return;
        if (timeline.dataset.serverList === "audit") return;
        if (!events.length && !billingData.source) return;
        const iconForType = (type) => ({
            online_payment: "credit_card",
            operator_payment: "payments",
            balance: "account_balance_wallet",
            period_edit: "edit_note",
            period_status: "receipt_long",
            telegram: "send",
        }[type] || "history");
        timeline.innerHTML = events.map((event) => `
            <div class="audit-event" data-audit-event data-type="${escapeAttr(event.type || "system")}" data-audit-backend-id="${escapeAttr(event.backendId || "")}" data-audit-time="${escapeAttr(event.time || "")}" data-audit-label="${escapeAttr(event.label || event.type || "")}" data-audit-title="${escapeAttr(event.title || "")}" data-audit-message="${escapeAttr(event.message || event.title || "")}" data-audit-actor="${escapeAttr(event.actor || "")}" data-audit-complex="${escapeAttr(event.complexName || "")}" data-audit-building="${escapeAttr(event.buildingName || "")}" data-audit-apartment="${escapeAttr(event.apartmentNumber || "")}" data-audit-owner="${escapeAttr(event.ownerName || "")}" data-audit-admin-url="${escapeAttr(event.adminUrl || "")}">
                <span class="audit-event-icon material-symbols-outlined">${escapeHtml(iconForType(event.type))}</span>
                <div>
                    <time>${escapeHtml(event.time || "")}</time>
                    <strong class="audit-event-actor">${escapeHtml(event.actorName || event.actor || "System")}${event.ipAddress ? ` · ${escapeHtml(event.ipAddress)}` : ""}</strong>
                    <p>${escapeHtml(event.message || event.title || "")}</p>
                    <span>${escapeHtml(event.label || event.type || "System")}</span>
                </div>
            </div>
        `).join("");
        timeline.dataset.backendAuditRendered = "true";
    };

    const renderSupportDrawer = () => {
        const drawer = document.getElementById("support-drawer");
        if (!drawer) return;
        const summary = billingData.supportSummary || {};
        const tickets = Array.isArray(billingData.supportTickets) ? billingData.supportTickets : [];
        const setText = (selector, value) => {
            const node = drawer.querySelector(selector);
            if (node) node.textContent = value ?? "";
        };
        setText("[data-support-helpdesk]", summary.helpdesk || "Operations helpdesk");
        setText("[data-support-open-tickets]", String(summary.openTickets ?? tickets.filter((ticket) => ticket.status === "open").length));
        setText("[data-support-in-progress]", String(summary.inProgress ?? tickets.filter((ticket) => ticket.status === "in_progress").length));
        setText("[data-support-resolved]", String(summary.resolved ?? tickets.filter((ticket) => ticket.status === "resolved").length));
        setText("[data-support-updated]", summary.updatedAt || "Backend sync active");
        setText("[data-support-headline]", summary.headline || "Operational issues sync through Django admin helpdesk.");
        setText("[data-support-summary-caption]", summary.caption || "Use this drawer to copy the current support summary, create a backend helpdesk ticket, or open the checklist.");
        drawer.dataset.latestSupportTicket = tickets[0]?.title || "";
    };

    const setupAuditTools = () => {
        const drawer = document.getElementById("audit-drawer");
        if (!drawer || drawer.dataset.auditReady === "true") return;
        drawer.dataset.auditReady = "true";
        const timeline = drawer.querySelector("[data-audit-timeline]");
        const search = drawer.querySelector("[data-audit-search]");
        const filters = Array.from(drawer.querySelectorAll("[data-audit-filter]"));
        const empty = drawer.querySelector("[data-audit-empty]");
        const totalLabel = drawer.querySelector("[data-audit-total]");
        const visibleLabel = drawer.querySelector("[data-audit-visible]");
        const isServerDriven = timeline?.dataset.serverList === "audit";
        let activeType = "all";

        const getEvents = () => Array.from(drawer.querySelectorAll("[data-audit-event]"));
        const refreshAudit = () => {
            if (isServerDriven) return;
            const query = search?.value.trim().toLowerCase() || "";
            const events = getEvents();
            let visible = 0;
            events.forEach((event) => {
                const typeMatch = activeType === "all" || event.dataset.type === activeType;
                const queryMatch = !query || event.textContent.toLowerCase().includes(query);
                const show = typeMatch && queryMatch;
                event.classList.toggle("hidden", !show);
                if (show) visible += 1;
            });
            if (totalLabel) totalLabel.textContent = String(events.length);
            if (visibleLabel) visibleLabel.textContent = String(visible);
            empty?.classList.toggle("hidden", visible > 0);
        };

        if (!isServerDriven) {
            filters.forEach((button) => button.addEventListener("click", () => {
                activeType = button.dataset.auditFilter || "all";
                filters.forEach((item) => item.classList.toggle("is-active", item === button));
                refreshAudit();
            }));
            search?.addEventListener("input", refreshAudit);
        }


        drawer.querySelector("[data-audit-action='copy-latest']")?.addEventListener("click", async () => {
            const latest = getEvents().find((event) => !event.classList.contains("hidden")) || getEvents()[0];
            const text = latest?.textContent.trim().replace(/\s+/g, " ") || t("No audit events found");
            try {
                await navigator.clipboard?.writeText(text);
                toast(t("Latest audit event copied"), text, "success");
            } catch {
                toast(t("Latest audit event ready"), text, "info");
            }
        });

        drawer.querySelector("[data-audit-action='export']")?.addEventListener("click", async (event) => {
            const button = event.currentTarget;
            button.disabled = true;
            try {
                const activeFilter = filters.find((filter) => filter.classList.contains("is-active"))?.dataset.auditFilter || "all";
                const { params } = currentGlobalListFilters();
                const payload = await postPortalJson("/api/audit/export/", {
                    ...params,
                    search: search?.value.trim() || "",
                    type: activeFilter === "all" ? "" : activeFilter,
                    user_id: drawer.querySelector("[data-audit-user]")?.value || "",
                    language: storage.getItem("hydroflow-lang") || "en",
                });
                triggerDownloadPayload(payload.download);
                rehydrateFromPortalData(payload.portalData);
                toast(t("Audit log exported"), "XLSX file generated from backend audit events.", "success");
            } catch (error) {
                toast(t("Audit export failed"), error.message || "Backend XLSX export was not generated.", "danger");
            } finally {
                button.disabled = false;
            }
        });

        refreshAudit();
    };

    const setupSupportTools = () => {
        const drawer = document.getElementById("support-drawer");
        if (!drawer || drawer.dataset.supportReady === "true") return;
        drawer.dataset.supportReady = "true";
        renderSupportDrawer();
        drawer.querySelectorAll("[data-support-action]").forEach((button) => button.addEventListener("click", async (event) => {
            const action = button.dataset.supportAction;
            if (action === "copy-summary") {
                const summaryData = billingData.supportSummary || {};
                const summary = [
                    summaryData.helpdesk || "Operations helpdesk",
                    `Open: ${summaryData.openTickets ?? 0}`,
                    `In progress: ${summaryData.inProgress ?? 0}`,
                    `Resolved: ${summaryData.resolved ?? 0}`,
                    `Updated: ${summaryData.updatedAt || "Backend sync active"}`,
                ].join(" | ");
                try {
                    await navigator.clipboard?.writeText(summary);
                    toast("Support summary copied", summary, "success");
                } catch {
                    toast("Support summary ready", summary, "info");
                }
            }
            if (action === "open-checklist") {
                event.preventDefault();
                event.stopPropagation();
                window.HydroFlowOpenChecklist?.("Support workspace");
            }
            if (action === "report-ui") {
                try {
                    const payload = await postPortalJson("/api/support/ticket/", {
                        title: "Portal UI issue reported",
                        message: "Support drawer created a UI review ticket from the current portal session.",
                        category: "ui",
                        priority: "medium",
                        source: "portal_support_drawer",
                    });
                    rehydrateFromPortalData(payload.portalData);
                    renderSupportDrawer();
                    toast("Support ticket created", "UI issue was added to backend helpdesk.", "success");
                } catch (error) {
                    toast("Support ticket failed", error.message || "Backend helpdesk request failed.", "danger");
                }
            }
        }));
    };

    renderBackendAuditEvents();
    setupChecklist();
    syncSidebarTodoCount();
    setupAuditTools();
    setupSupportTools();
    setupBillingNoticeQuickAction();
    setupBillingPeriodQuickAction();
    window.HydroFlowRenderSupport = renderSupportDrawer;

    document.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        if (
            button.matches("[data-resident-kit-action], [data-system-alert-link]")
            || button.closest("[data-resident-kit-action], [data-system-alert-link]")
        ) {
            return;
        }
        const actionKey = button.dataset.actionKey || button.dataset.i18nKey || button.textContent.trim();
        const normalizedActionKey = String(button.dataset.actionKey || "").trim().toLowerCase();
        const label = actionKey.toLowerCase();
        const lang = storage.getItem("hydroflow-lang") || "en";
        if (label.includes("apply filters")) toast(translateValue("Filters applied", lang), "Current data view updated.");
        if (label.includes("reset filters")) toast(translateValue("Filters reset", lang), "Default data view restored.");
        if (label.includes("open checklist")) {
            event.preventDefault();
            window.HydroFlowOpenChecklist?.("Operations");
        }
        if (label.includes("edit profile")) {
            const adminUrl = billingData.profile?.adminUrl || "/admin/portal/workspaceprofile/";
            window.location.assign(adminUrl);
        }
        if (normalizedActionKey === "sign out" || label.includes("sign out")) {
            event.preventDefault();
            postPortalJson("/api/logout/", {})
                .then((payload) => {
                    window.location.assign(payload.redirectUrl || "/login/");
                })
                .catch(() => {
                    toast(translateValue("Logout request failed.", lang), "", "danger");
                });
            return;
        }
    });
})();
