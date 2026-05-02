(() => {
    const root = document.documentElement;
    const storage = window.localStorage;
    const languageOrder = ["en", "ru", "uz"];
    const translations = {
        "Utility Management": { ru: "Управление коммунальными услугами", uz: "Kommunal boshqaruv" },
        "Dashboard": { ru: "Обзор", uz: "Boshqaruv paneli" },
        "Residents": { ru: "Абоненты", uz: "Abonentlar" },
        "Residential Units": { ru: "Жилые объекты", uz: "Turar joy obyektlari" },
        "Properties": { ru: "Дома", uz: "Uylar" },
        "System Health": { ru: "Состояние систем", uz: "Tizim holati" },
        "Billing & Debt": { ru: "Платежи и долги", uz: "To'lovlar va qarzlar" },
        "Payments": { ru: "Платежи и долги", uz: "To'lovlar va qarzlar" },
        "Analytics": { ru: "Аналитика", uz: "Tahlil" },
        "Reports": { ru: "Статистика", uz: "Statistika" },
        "Settings": { ru: "Настройки", uz: "Sozlamalar" },
        "Recent requests": { ru: "Недавние запросы", uz: "So'nggi so'rovlar" },
        "No results": { ru: "Ничего не найдено", uz: "Natija topilmadi" },
        "Admin User": { ru: "Администратор", uz: "Administrator" },
        "Administrator": { ru: "Администратор", uz: "Administrator" },
        "Profile": { ru: "Профиль", uz: "Profil" },
        "Logs": { ru: "Логи", uz: "Loglar" },
        "Action history": { ru: "История действий", uz: "Amallar tarixi" },
        "Preferences": { ru: "Предпочтения", uz: "Afzalliklar" },
        "Organization settings": { ru: "Настройки организации", uz: "Tashkilot sozlamalari" },
        "Audit log": { ru: "Журнал аудита", uz: "Audit jurnali" },
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
        "Email": { ru: "Email", uz: "Email" },
        "Role": { ru: "Роль", uz: "Rol" },
        "Organization": { ru: "Организация", uz: "Tashkilot" },
        "Access level": { ru: "Уровень доступа", uz: "Ruxsat darajasi" },
        "Full operations access": { ru: "Полный операционный доступ", uz: "To'liq operatsion ruxsat" },
        "Security": { ru: "Безопасность", uz: "Xavfsizlik" },
        "Two-factor authentication": { ru: "Двухфакторная аутентификация", uz: "Ikki faktorli autentifikatsiya" },
        "Enabled": { ru: "Включено", uz: "Yoqilgan" },
        "Session status": { ru: "Статус сессии", uz: "Sessiya holati" },
        "This profile preview is local until the backend admin panel is connected.": { ru: "Профиль пока локальный, пока не подключена backend admin panel.", uz: "Backend admin panel ulanmaguncha profil mahalliy ko'rinishda." },
        "Edit profile": { ru: "Редактировать профиль", uz: "Profilni tahrirlash" },
        "Profile update queued": { ru: "Обновление профиля поставлено в очередь", uz: "Profil yangilanishi navbatga qo'yildi" },
        "Sign out unavailable": { ru: "Выход пока недоступен", uz: "Chiqish hozircha mavjud emas" },
        "Notifications": { ru: "Уведомления", uz: "Bildirishnomalar" },
        "To do": { ru: "Задачи", uz: "Vazifalar" },
        "Unread operational events and assigned actions.": { ru: "Непрочитанные события и назначенные действия.", uz: "O'qilmagan hodisalar va tayinlangan amallar." },
        "3 unread": { ru: "3 непрочитанных", uz: "3 ta o'qilmagan" },
        "Mark all as read": { ru: "Отметить все как прочитанные", uz: "Hammasini o'qilgan qilish" },
        "Critical": { ru: "Критично", uz: "Jiddiy" },
        "Warning": { ru: "Предупреждение", uz: "Ogohlantirish" },
        "Info": { ru: "Информация", uz: "Ma'lumot" },
        "Pressure drop detected": { ru: "Обнаружено падение давления", uz: "Bosim pasayishi aniqlandi" },
        "Skyline Residences, Block B. Detected 12 minutes ago.": { ru: "Skyline Residences, блок B. Обнаружено 12 минут назад.", uz: "Skyline Residences, B-blok. 12 daqiqa oldin aniqlandi." },
        "Assign technician": { ru: "Назначить техника", uz: "Texnik tayinlash" },
        "Details": { ru: "Детали", uz: "Tafsilotlar" },
        "Sensor calibration scheduled": { ru: "Запланирована калибровка датчиков", uz: "Sensor kalibrlash rejalashtirilgan" },
        "Vista Towers, today at 09:00.": { ru: "Vista Towers, сегодня в 09:00.", uz: "Vista Towers, bugun 09:00 da." },
        "Open schedule": { ru: "Открыть график", uz: "Jadvalni ochish" },
        "Mute": { ru: "Отключить", uz: "O'chirish" },
        "Payment batch imported": { ru: "Пакет платежей импортирован", uz: "To'lovlar paketi import qilindi" },
        "412 records from Payme and Click are ready for review.": { ru: "412 записей из Payme и Click готовы к проверке.", uz: "Payme va Clickdan 412 yozuv tekshiruvga tayyor." },
        "Review batch": { ru: "Проверить пакет", uz: "Paketni tekshirish" },
        "Archive": { ru: "Архив", uz: "Arxiv" },
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
        "Last 30 Days": { ru: "Последние 30 дней", uz: "So'nggi 30 kun" },
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
        "All short": { ru: "Все", uz: "Jami" },
        "Debtors short": { ru: "Долг", uz: "Qarz" },
        "Paid short": { ru: "Оплата", uz: "To'lov" },
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
        "Unassigned": { ru: "Не назначен", uz: "Belgilanmagan" },
        "Activity timeline": { ru: "Лента активности", uz: "Faoliyat tarixi" },
        "Close critical alert": { ru: "Закрыть критичный alert", uz: "Jiddiy alertni yopish" },
        "Reset filters?": { ru: "Сбросить фильтры?", uz: "Filtrlarni tozalaysizmi?" },
        "Close this critical alert?": { ru: "Закрыть это критичное уведомление?", uz: "Bu jiddiy ogohlantirish yopilsinmi?" },
        "Alert closed": { ru: "Уведомление закрыто", uz: "Ogohlantirish yopildi" },
        "Density updated": { ru: "Плотность обновлена", uz: "Zichlik yangilandi" },
        "Overview": { ru: "Обзор", uz: "Umumiy ko'rinish" },
        "Real-time infrastructure monitoring for North Sector.": { ru: "Мониторинг инфраструктуры Северного сектора в реальном времени.", uz: "Shimoliy sektor infratuzilmasi real vaqt monitoringi." },
        "All Systems Operational": { ru: "Все системы работают", uz: "Barcha tizimlar ishlamoqda" },
        "Last check: 2m ago": { ru: "Последняя проверка: 2 мин назад", uz: "Oxirgi tekshiruv: 2 daqiqa oldin" },
        "Total Revenue": { ru: "Общая выручка", uz: "Jami tushum" },
        "Total Residents": { ru: "Всего резидентов", uz: "Jami rezidentlar" },
        "Paid Residents": { ru: "Оплатили", uz: "To'laganlar" },
        "Total Debtors": { ru: "Всего должников", uz: "Jami qarzdorlar" },
        "Total linked resident profiles": { ru: "Всего привязанных профилей резидентов", uz: "Jami ulangan rezident profillari" },
        "Residents with positive or zero balance": { ru: "Резиденты с положительным или нулевым балансом", uz: "Musbat yoki nol balansli rezidentlar" },
        "Residents with overdue balance": { ru: "Резиденты с просроченным балансом", uz: "Muddati o'tgan balansli rezidentlar" },
        "Current resident liabilities": { ru: "Текущие обязательства резидентов", uz: "Rezidentlarning joriy majburiyatlari" },
        "Resident Directory": { ru: "Каталог резидентов", uz: "Rezidentlar katalogi" },
        "Name": { ru: "Имя", uz: "Ism" },
        "Actions": { ru: "Действия", uz: "Amallar" },
        "Reset": { ru: "Сбросить", uz: "Tozalash" },
        "Adjust filters to show matching resident profiles.": { ru: "Измените фильтры, чтобы показать подходящие профили резидентов.", uz: "Mos rezident profillarini ko'rsatish uchun filtrlarni o'zgartiring." },
        "Linked resident profiles with contact, apartment and Telegram sync details.": { ru: "Привязанные профили резидентов с контактами, квартирой и Telegram-статусом.", uz: "Kontakt, kvartira va Telegram holati bilan ulangan rezident profillari." },
        "Telegram": { ru: "Telegram", uz: "Telegram" },
        "Connected": { ru: "Подключён", uz: "Ulangan" },
        "Pending": { ru: "Ожидает", uz: "Kutilmoqda" },
        "Not linked": { ru: "Не подключён", uz: "Ulanmagan" },
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
        "Total Complexes": { ru: "Всего домов", uz: "Jami uylar" },
        "Active Buildings": { ru: "Активные здания", uz: "Faol binolar" },
        "Occupancy Rate": { ru: "Заполняемость", uz: "Bandlik darajasi" },
        "Critical Debt Units": { ru: "Критичные должники", uz: "Jiddiy qarzdor obyektlar" },
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
        "Critical Alert": { ru: "Критичное уведомление", uz: "Jiddiy ogohlantirish" },
        "Quick Actions": { ru: "Быстрые действия", uz: "Tezkor amallar" },
        "Generate Usage Report": { ru: "Сформировать отчёт потребления", uz: "Iste'mol hisobotini yaratish" },
        "Add New Resident Profile": { ru: "Добавить профиль жильца", uz: "Yangi yashovchi profilini qo'shish" },
        "Generate Billing Notice": { ru: "Сформировать уведомление", uz: "To'lov xabarnomasini yaratish" },
        "Payment workspace": { ru: "Платёжное окно", uz: "To'lov oynasi" },
        "Find a resident, confirm the profile and write a real payment to the database.": { ru: "Найдите абонента, проверьте профиль и запишите реальный платёж в базу данных.", uz: "Abonentni toping, profilni tasdiqlang va haqiqiy to'lovni bazaga yozing." },
        "Live resident search from current backend data.": { ru: "Живой поиск по текущим backend-данным.", uz: "Joriy backend ma'lumotlari bo'yicha jonli qidiruv." },
        "Adjust the query to find a resident in the database.": { ru: "Измените запрос, чтобы найти абонента в базе.", uz: "Bazadan abonent topish uchun so'rovni o'zgartiring." },
        "Resident payment profile": { ru: "Платёжный профиль абонента", uz: "Abonentning to'lov profili" },
        "Amount": { ru: "Сумма", uz: "Summa" },
        "Operation": { ru: "Операция", uz: "Amal" },
        "Add funds": { ru: "Зачислить", uz: "Hisobga kiritish" },
        "Credit": { ru: "Зачислить", uz: "Hisobga kiritish" },
        "Subtract": { ru: "Вычесть", uz: "Ayrish" },
        "Channel": { ru: "Канал", uz: "Kanal" },
        "Cash": { ru: "Наличные", uz: "Naqd" },
        "Terminal": { ru: "Терминал", uz: "Terminal" },
        "Save payment": { ru: "Сохранить платёж", uz: "To'lovni saqlash" },
        "A real transaction will be written to the database and all balances will refresh from backend data.": { ru: "В базу будет записана реальная транзакция, после чего все балансы обновятся из backend-данных.", uz: "Bazaga haqiqiy tranzaksiya yoziladi va barcha balanslar backend ma'lumotlaridan yangilanadi." },
        "Select a resident": { ru: "Выберите абонента", uz: "Abonentni tanlang" },
        "Choose a resident on the left to prepare a real payment operation.": { ru: "Выберите абонента слева, чтобы подготовить реальную платёжную операцию.", uz: "Haqiqiy to'lov amalini tayyorlash uchun chapdan abonentni tanlang." },
        "Search by name, phone, Telegram, house or apartment...": { ru: "Поиск по имени, телефону, Telegram, дому или квартире...", uz: "Ism, telefon, Telegram, uy yoki xonadon bo'yicha qidiring..." },
        "Syncing backend data...": { ru: "Синхронизация backend-данных...", uz: "Backend ma'lumotlari sinxronlanmoqda..." },
        "Saving payment...": { ru: "Сохранение платежа...", uz: "To'lov saqlanmoqda..." },
        "Resident ID could not be resolved.": { ru: "Не удалось определить ID абонента.", uz: "Abonent ID aniqlanmadi." },
        "Amount must be greater than zero.": { ru: "Сумма должна быть больше нуля.", uz: "Summa noldan katta bo'lishi kerak." },
        "Payment saved to database.": { ru: "Платёж записан в базу данных.", uz: "To'lov bazaga yozildi." },
        "Balance subtraction saved to database.": { ru: "Списание баланса записано в базу данных.", uz: "Balans ayirimi bazaga yozildi." },
        "A real balance subtraction will be written to the database and resident totals will refresh from backend data.": { ru: "В базу будет записано реальное списание, после чего суммы обновятся из backend-данных.", uz: "Bazaga haqiqiy ayirma yoziladi va summalar backend ma'lumotlaridan yangilanadi." },
        "Payment saved": { ru: "Платёж сохранён", uz: "To'lov saqlandi" },
        "Balance updated": { ru: "Баланс обновлён", uz: "Balans yangilandi" },
        "Cash payment was written to backend database.": { ru: "Платёж наличными записан в backend-базу.", uz: "Naqd to'lov backend bazaga yozildi." },
        "Terminal payment was written to backend database.": { ru: "Платёж через терминал записан в backend-базу.", uz: "Terminal orqali to'lov backend bazaga yozildi." },
        "Manual subtraction was written to backend database.": { ru: "Ручное списание записано в backend-базу.", uz: "Qo'lda ayirma backend bazaga yozildi." },
        "Billing notice": { ru: "Платёжное уведомление", uz: "To'lov xabarnomasi" },
        "Preview of the resident debt notice generated from current backend data.": { ru: "Предпросмотр уведомления о долге, собранного из текущих backend-данных.", uz: "Joriy backend ma'lumotlaridan yig'ilgan qarzdorlik xabarnomasi ko'rinishi." },
        "Select a debtor, review the generated notice and copy or send it later.": { ru: "Выберите должника, проверьте сгенерированное письмо и затем скопируйте или отправьте его позже.", uz: "Qarzdorni tanlang, yaratilgan xabarnomani ko'rib chiqing va keyin nusxa oling yoki keyinroq yuboring." },
        "Create Billing Period": { ru: "Создать расчётный период", uz: "Hisob davrini yaratish" },
        "Create a new расчетный период for heating and hot water calculations.": { ru: "Создать новый расчётный период для отопления и горячей воды.", uz: "Isitish va issiq suv hisoblari uchun yangi hisob davrini yarating." },
        "Open admin form": { ru: "Открыть admin форму", uz: "Admin formasini ochish" },
        "Back to Billing": { ru: "Назад к биллингу", uz: "Billing sahifasiga qaytish" },
        "Search debtors...": { ru: "Поиск должников...", uz: "Qarzdorlarni qidirish..." },
        "Debtors": { ru: "Должники", uz: "Qarzdorlar" },
        "Choose a resident to preview the billing notice.": { ru: "Выберите резидента, чтобы увидеть платёжное уведомление.", uz: "To'lov xabarnomasini ko'rish uchun rezidentni tanlang." },
        "Debt order": { ru: "Порядок долга", uz: "Qarz tartibi" },
        "Largest debt": { ru: "Макс. долг", uz: "Eng katta qarz" },
        "Smallest debt": { ru: "Мин. долг", uz: "Eng kichik qarz" },
        "Largest first": { ru: "Сначала большой", uz: "Katta qarz avval" },
        "Smallest first": { ru: "Сначала малый", uz: "Kichik qarz avval" },
        "shown": { ru: "показано", uz: "ko'rsatildi" },
        "Loading debtors...": { ru: "Загрузка должников...", uz: "Qarzdorlar yuklanmoqda..." },
        "No debtors found": { ru: "Должники не найдены", uz: "Qarzdorlar topilmadi" },
        "Adjust search or filters to find a resident with overdue balance.": { ru: "Измените поиск или фильтр, чтобы найти резидента с просроченным балансом.", uz: "Muddati o'tgan balansli rezidentni topish uchun qidiruv yoki filtrni o'zgartiring." },
        "Copy notice": { ru: "Скопировать уведомление", uz: "Xabarnomani nusxalash" },
        "Notify in Telegram": { ru: "Уведомить в Telegram", uz: "Telegramda xabardor qilish" },
        "Billing notice copied": { ru: "Уведомление скопировано", uz: "Xabarnoma nusxalandi" },
        "Notice text was copied to clipboard.": { ru: "Текст уведомления скопирован в буфер обмена.", uz: "Xabarnoma matni almashish buferiga nusxalandi." },
        "Copy failed": { ru: "Не удалось скопировать", uz: "Nusxalab bo'lmadi" },
        "Could not copy notice text.": { ru: "Не удалось скопировать текст уведомления.", uz: "Xabarnoma matnini nusxalab bo'lmadi." },
        "In development": { ru: "В разработке", uz: "Ishlanmoqda" },
        "Telegram notification flow is not connected yet.": { ru: "Логика уведомления в Telegram пока не подключена.", uz: "Telegram orqali xabardor qilish hali ulanmagan." },
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
        "Ready to create a live system alert.": { ru: "Готово к созданию live system alert.", uz: "Jonli tizim ogohlantirishini yaratishga tayyor." },
        "Whole complex": { ru: "Весь дом", uz: "Butun uy" },
        "System alert": { ru: "Системное уведомление", uz: "Tizim ogohlantirishi" },
        "Acknowledge": { ru: "Подтвердить", uz: "Tasdiqlash" },
        "Resolve": { ru: "Решить", uz: "Hal qilish" },
        "Admin": { ru: "Админ", uz: "Admin" },
        "No live alerts in backend. Create one from this panel.": { ru: "В backend нет активных уведомлений. Создайте новое в этой панели.", uz: "Backendda faol ogohlantirishlar yo'q. Shu paneldan yangisini yarating." },
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
        "critical": { ru: "критично", uz: "kritik" },
        "warning": { ru: "предупреждение", uz: "ogohlantirish" },
        "info": { ru: "инфо", uz: "ma'lumot" },
        "Debtor Trends": { ru: "Динамика должников", uz: "Qarzdorlar dinamikasi" },
        "High Risk": { ru: "Высокий риск", uz: "Yuqori xavf" },
        "Critical Debtors (Top 3 Δ)": { ru: "Критичные должники (топ 3 Δ)", uz: "Jiddiy qarzdorlar (top 3 Δ)" },
        "Critical Houses (Top 5)": { ru: "Критичные дома (топ 5)", uz: "Jiddiy uylar (top 5)" },
        "View All Debtors": { ru: "Все должники", uz: "Barcha qarzdorlar" },
        "View All Houses": { ru: "Все дома", uz: "Barcha uylar" },
        "debt residents": { ru: "должников", uz: "qarzdor rezidentlar" },
        "Analytics Overview": { ru: "Обзор аналитики", uz: "Tahlil sharhi" },
        "Real-time system performance and fiscal health": { ru: "Производительность системы и финансовое состояние в реальном времени", uz: "Tizim samaradorligi va moliyaviy holat real vaqtda" },
        "Last 3 Months": { ru: "Последние 3 месяца", uz: "So'nggi 3 oy" },
        "Filter Views": { ru: "Фильтр видов", uz: "Ko'rinishlarni filtrlash" },
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
        "Water Pressure Status": { ru: "Статус давления воды", uz: "Suv bosimi holati" },
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
        "Total Outstanding": { ru: "Общая задолженность", uz: "Jami qarzdorlik" },
        "Collection Rate": { ru: "Уровень сборов", uz: "Yig'im darajasi" },
        "Total Complex Usage": { ru: "Общее потребление дома", uz: "Uy bo'yicha jami iste'mol" },
        "Nominal Flow Detected": { ru: "Номинальный поток", uz: "Nominal oqim aniqlandi" },
        "Active Residents": { ru: "Активные жильцы", uz: "Faol yashovchilar" },
        "Filter:": { ru: "Фильтр:", uz: "Filtr:" },
        "ALL": { ru: "ВСЕ", uz: "HAMMASI" },
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
        "Water Demand": { ru: "Спрос на воду", uz: "Suv talabi" },
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
        "Residential complex detail preview.": { ru: "Демо-детали дома.", uz: "Uy tafsilotlari." },
        "Heating maintenance window pending": { ru: "Ожидается окно обслуживания отопления", uz: "Isitish xizmati oynasi kutilmoqda" },
        "Schedule technician assignment before 15 Apr 2026.": { ru: "Назначьте техника до 15 Apr 2026.", uz: "Texnikni 15 Apr 2026 gacha tayinlang." },
        "Balance report exported by Admin User.": { ru: "Администратор экспортировал отчёт баланса.", uz: "Administrator balans hisobotini eksport qildi." },
        "Reminder queued for overdue residents.": { ru: "Напоминание для должников поставлено в очередь.", uz: "Qarzdor yashovchilar uchun eslatma navbatga qo'yildi." },
        "Alert review completed after technician confirmation.": { ru: "Проверка alert завершена после подтверждения техника.", uz: "Texnik tasdig'idan keyin alert tekshiruvi yakunlandi." },
        "Admin User exported billing report for North Sector.": { ru: "Администратор экспортировал биллинговый отчёт Северного сектора.", uz: "Administrator Shimoliy sektor billing hisobotini eksport qildi." },
        "Debt reminder sent to Harbor View Heights.": { ru: "Напоминание о долге отправлено в Harbor View Heights.", uz: "Harbor View Heights uchun qarz eslatmasi yuborildi." },
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
        "Infrastructure & System Health": { ru: "Инфраструктура и состояние систем", uz: "Infratuzilma va tizim holati" },
        "Real-time status of water distribution and thermal cores across all zones.": { ru: "Статус водораспределения и тепловых узлов по всем зонам в реальном времени.", uz: "Barcha zonalar bo'yicha suv taqsimoti va issiqlik yadrolari holati real vaqtda." },
        "Export Logs": { ru: "Экспорт логов", uz: "Loglarni eksport qilish" },
        "Deploy Maintenance": { ru: "Запланировать обслуживание", uz: "Texnik xizmatni joylash" },
        "Overall System Efficiency": { ru: "Общая эффективность системы", uz: "Tizimning umumiy samaradorligi" },
        "Active Alerts": { ru: "Активные оповещения", uz: "Faol ogohlantirishlar" },
        "Minor": { ru: "Незначительные", uz: "Mayda" },
        "0 CRITICAL TASKS PENDING": { ru: "0 критических задач ожидает", uz: "0 ta jiddiy vazifa kutilmoqda" },
        "Live": { ru: "Онлайн", uz: "Jonli" },
        "Stable": { ru: "Стабильно", uz: "Barqaror" },
        "Heating Core Temp": { ru: "Температура теплового ядра", uz: "Issiqlik yadrosi harorati" },
        "Live network layer": { ru: "Активный сетевой слой", uz: "Jonli tarmoq qatlami" },
        "Network Health": { ru: "Состояние сети", uz: "Tarmoq holati" },
        "Operational status across residential nodes": { ru: "Операционный статус жилых узлов", uz: "Turar joy tugunlari bo'yicha operatsion holat" },
        "Online": { ru: "Онлайн", uz: "Onlayn" },
        "Issue": { ru: "Проблема", uz: "Muammo" },
        "Issue detected": { ru: "Обнаружена проблема", uz: "Muammo aniqlandi" },
        "Zone Alpha": { ru: "Зона Альфа", uz: "Alfa zonasi" },
        "Thermal Core": { ru: "Тепловое ядро", uz: "Issiqlik yadrosi" },
        "Primary distribution hub": { ru: "Основной распределительный узел", uz: "Asosiy taqsimot markazi" },
        "Pressure drop in Block B": { ru: "Падение давления в блоке B", uz: "B-blokda bosim pasaydi" },
        "Secondary pressure cluster": { ru: "Вторичный кластер давления", uz: "Ikkilamchi bosim klasteri" },
        "Main inlet and thermal telemetry": { ru: "Главный ввод и тепловая телеметрия", uz: "Asosiy kirish va issiqlik telemetriyasi" },
        "Heating core telemetry relay": { ru: "Ретранслятор тепловой телеметрии", uz: "Issiqlik telemetriyasi releysi" },
        "Updated 09:41": { ru: "Обновлено 09:41", uz: "09:41 da yangilandi" },
        "Pressure": { ru: "Давление", uz: "Bosim" },
        "Flow": { ru: "Поток", uz: "Oqim" },
        "Latency": { ru: "Задержка", uz: "Kechikish" },
        "Uptime": { ru: "Аптайм", uz: "Ish vaqti" },
        "1.8M l/day": { ru: "1.8M л/день", uz: "1.8M l/kun" },
        "0.9M l/day": { ru: "0.9M л/день", uz: "0.9M l/kun" },
        "1.2M l/day": { ru: "1.2M л/день", uz: "1.2M l/kun" },
        "1.5M l/day": { ru: "1.5M л/день", uz: "1.5M l/kun" },
        "83% load": { ru: "83% нагрузки", uz: "83% yuklama" },
        "Nominal": { ru: "Номинально", uz: "Nominal" },
        "Open node details": { ru: "Открыть детали узла", uz: "Tugun tafsilotlarini ochish" },
        "Network node": { ru: "Сетевой узел", uz: "Tarmoq tuguni" },
        "Network node detail preview.": { ru: "Предпросмотр деталей сетевого узла.", uz: "Tarmoq tuguni tafsilotlari ko'rinishi." },
        "Pressure anomaly is active. Assign a technician before SLA breach.": { ru: "Активна аномалия давления. Назначьте техника до нарушения SLA.", uz: "Bosim anomaliyasi faol. SLA buzilishidan oldin texnik tayinlang." },
        "No active alerts for this node.": { ru: "По этому узлу нет активных оповещений.", uz: "Bu tugun bo'yicha faol ogohlantirishlar yo'q." },
        "Water Pressure Stability": { ru: "Стабильность давления воды", uz: "Suv bosimi barqarorligi" },
        "Real-time telemetry from main supply line (last 24h)": { ru: "Телеметрия главной линии подачи в реальном времени (последние 24 часа)", uz: "Asosiy ta'minot liniyasi telemetriyasi real vaqtda (so'nggi 24 soat)" },
        "ACTUAL PSI": { ru: "ФАКТИЧЕСКИЙ PSI", uz: "AMALDAGI PSI" },
        "NOMINAL TARGET": { ru: "ЦЕЛЕВОЙ НОМИНАЛ", uz: "NOMINAL MAQSAD" },
        "NOW": { ru: "СЕЙЧАС", uz: "HOZIR" },
        "CRITICAL ALERTS": { ru: "КРИТИЧЕСКИЕ ОПОВЕЩЕНИЯ", uz: "JIDDIY OGOHLANTIRISHLAR" },
        "ACT NOW": { ru: "СРОЧНО", uz: "ZUDLIK BILAN" },
        "Pressure Drop Detected": { ru: "Обнаружено падение давления", uz: "Bosim pasayishi aniqlandi" },
        "Skyline Residences - Block B": { ru: "Skyline Residences - блок B", uz: "Skyline Residences - B-blok" },
        "Detected: 12m ago": { ru: "Обнаружено: 12 мин назад", uz: "Aniqlandi: 12 daqiqa oldin" },
        "Secondary Pump Offline": { ru: "Вторичный насос отключён", uz: "Ikkilamchi nasos oflayn" },
        "Industrial Sector 4": { ru: "Промышленный сектор 4", uz: "Sanoat sektori 4" },
        "Backup systems active.": { ru: "Резервные системы активны.", uz: "Zaxira tizimlar faol." },
        "View All Active Alerts": { ru: "Смотреть все активные оповещения", uz: "Barcha faol ogohlantirishlarni ko'rish" },
        "UPCOMING MAINTENANCE": { ru: "ПРЕДСТОЯЩЕЕ ОБСЛУЖИВАНИЕ", uz: "KUTILAYOTGAN TEXNIK XIZMAT" },
        "APR": { ru: "АПР", uz: "APR" },
        "MAY": { ru: "МАЙ", uz: "MAY" },
        "Sensor Calibration": { ru: "Калибровка датчиков", uz: "Sensor kalibrlash" },
        "Pipe Retrofitting": { ru: "Модернизация трубопровода", uz: "Quvurni modernizatsiya qilish" },
        "Thermal Core Flush": { ru: "Промывка теплового ядра", uz: "Issiqlik yadrosini yuvish" },
        "Vista Towers • 09:00": { ru: "Vista Towers • 09:00", uz: "Vista Towers • 09:00" },
        "Zone Delta • 13:30": { ru: "Зона Дельта • 13:30", uz: "Delta zonasi • 13:30" },
        "Main Hub • 22:00": { ru: "Главный узел • 22:00", uz: "Asosiy markaz • 22:00" },
        "Scheduled": { ru: "Запланировано", uz: "Rejalashtirilgan" },
        "Planned": { ru: "В плане", uz: "Rejada" },
        "Pending": { ru: "Ожидает", uz: "Kutilmoqda" },
        "System Maintenance Log": { ru: "Журнал обслуживания системы", uz: "Tizim texnik xizmat jurnali" },
        "Historical and upcoming maintenance activities": { ru: "История и предстоящие работы по обслуживанию", uz: "Tarixiy va kutilayotgan texnik xizmat ishlari" },
        "Asset / Task": { ru: "Актив / задача", uz: "Aktiv / vazifa" },
        "Location": { ru: "Локация", uz: "Joylashuv" },
        "Priority": { ru: "Приоритет", uz: "Ustuvorlik" },
        "Date / Time": { ru: "Дата / время", uz: "Sana / vaqt" },
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
        "HydroFlow Enterprise v4.2.0 • Operational Authority Secured": { ru: "HydroFlow Enterprise v4.2.0 • Операционный доступ защищён", uz: "HydroFlow Enterprise v4.2.0 • Operatsion kirish himoyalangan" },
        "Home": { ru: "Главная", uz: "Bosh sahifa" },
        "Health": { ru: "Системы", uz: "Holat" },
        "Billing": { ru: "Платежи", uz: "To'lovlar" },
        "14 residents": { ru: "14 жильцов", uz: "14 yashovchi" },
        "+2 since last month": { ru: "+2 с прошлого месяца", uz: "O'tgan oydan +2" },
        "17,640,000 UZS expected today": { ru: "17,640,000 UZS ожидается сегодня", uz: "Bugun 17,640,000 UZS kutilmoqda" },
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
        "Operations checklist": { ru: "Операционный чеклист", uz: "Operatsion ro'yxat" },
        "Readiness checklist": { ru: "Чеклист готовности", uz: "Tayyorlik ro'yxati" },
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
        "Maintenance task opened": { ru: "Задача обслуживания открыта", uz: "Texnik xizmat vazifasi ochildi" },
        "Checklist opened": { ru: "Чеклист открыт", uz: "Ro'yxat ochildi" },
        "Complex": { ru: "Дом", uz: "Uy" },
        "Infra": { ru: "Инфра", uz: "Infra" },
        "Systems": { ru: "Системы", uz: "Tizim" },
        "Finance": { ru: "Финансы", uz: "Moliya" },
        "Actions": { ru: "Действия", uz: "Amal" },
        "House": { ru: "Дом", uz: "Uy" },
        "Apartment": { ru: "Квартира", uz: "Xonadon" },
        "Apartments": { ru: "Квартиры", uz: "Xonadonlar" },
        "Buildings": { ru: "Зданий", uz: "Binolar" },
        "Units": { ru: "Квартир", uz: "Xonadonlar" },
        "floors": { ru: "этажей", uz: "qavat" },
        "entrance": { ru: "подъезд", uz: "kirish" },
        "rooms": { ru: "комн.", uz: "xona" },
        "2 rooms": { ru: "2 комн.", uz: "2 xona" },
        "3 rooms": { ru: "3 комн.", uz: "3 xona" },
        "4 rooms": { ru: "4 комн.", uz: "4 xona" },
        "Monthly charge": { ru: "Ежемесячно", uz: "Oylik to'lov" },
        "Paid": { ru: "Оплатил", uz: "To'langan" },
        "Overdue": { ru: "Просрочено", uz: "Kechikkan" },
        "Review": { ru: "Проверка", uz: "Tekshiruv" },
        "Water": { ru: "Вода", uz: "Suv" },
        "Heating": { ru: "Отопление", uz: "Isitish" },
        "Optimal": { ru: "Оптимально", uz: "Optimal" },
        "Owner away": { ru: "Владелец не дома", uz: "Egasi uyda emas" },
        "Resident": { ru: "Жилец", uz: "Yashovchi" },
        "Phone copied": { ru: "Номер скопирован", uz: "Telefon nusxalandi" },
        "No matching buildings or residents": { ru: "Дома или жильцы не найдены", uz: "Uylar yoki yashovchilar topilmadi" },
        "System Logs": { ru: "Системные логи", uz: "Tizim loglari" },
        "API Documentation": { ru: "Документация API", uz: "API hujjatlari" },
        "© 2024 HydroFlow Enterprise v2.4.0 • Infrastructure Utility Protocol": { ru: "© 2024 HydroFlow Enterprise v2.4.0 • Протокол коммунальной инфраструктуры", uz: "© 2024 HydroFlow Enterprise v2.4.0 • Kommunal infratuzilma protokoli" },
    };

    const placeholderTranslations = {
        "Search data points...": { ru: "Поиск данных...", uz: "Ma'lumotlarni qidirish..." },
        "Search": { ru: "Поиск", uz: "Qidirish" },
        "Recent requests": { ru: "Недавние запросы", uz: "So'nggi so'rovlar" },
        "No results": { ru: "Ничего не найдено", uz: "Natija topilmadi" },
        "Search inside table...": { ru: "Поиск в таблице...", uz: "Jadvaldan qidirish..." },
        "Search residents...": { ru: "Поиск жильцов...", uz: "Yashovchilarni qidirish..." },
        "Search by name, phone, Telegram, house or apartment...": { ru: "Поиск по имени, телефону, Telegram, дому или квартире...", uz: "Ism, telefon, Telegram, uy yoki xonadon bo'yicha qidiring..." },
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
    const formatBillingUzs = (value) => `${moneyFormatter.format(Math.round(Number(value) || 0))} UZS`;
    const formatTelegramHandle = (value) => {
        const raw = String(value || "").trim();
        if (!raw) return "";
        return raw.startsWith("@") ? raw : `@${raw}`;
    };
    const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    }[char]));
    const initialsFor = (name) => String(name || "HF").split(/\s+/).map((part) => part[0] || "").join("").slice(0, 2).toUpperCase();

    const billingData = {
        complexes: [
            {
                id: "skyline",
                name: "Skyline Residential North",
                sector: "North Sector",
                prefix: "Skyline Tower",
                buildings: 12,
                units: 240,
                water: "Optimal",
                heating: "Optimal",
                health: 96.5,
                waterM3: 1280,
                heatingM3: 760,
                pressurePsi: 57,
                extraDebt: 15240000,
                baselineCollected: 25860000,
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6gjaUwDckqx_ZQBXv9DP5I-DALk4iq9XXR9g1yUccHYL2_mQ4becIAuAmMDHzZVYnEo8ksk07_OkpiWEIRfRUVytNrJOJxvSCaBStzZDNg9hkhHPRwnYaW_4ICj5y0k0n6Wfw6oemblkMTHqV3fnOU69f40EI_72399c5yrvXNNXe4cxUQCgK-Zmy_xv0NLzgdTZKV6jiLWRwVkB2MM8cqFIwJnJtA8Db0_-xM4kMkr4BKiwYEQx7mhWW87oYN3kMVvUz-S16FU0",
            },
            {
                id: "harbor",
                name: "Harbor View Heights",
                sector: "Harbor District",
                prefix: "Harbor Block",
                buildings: 8,
                units: 186,
                water: "Leak Alert",
                heating: "Optimal",
                health: 82.1,
                waterM3: 940,
                heatingM3: 620,
                pressurePsi: 42,
                extraDebt: 11840000,
                baselineCollected: 21350000,
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrwKadnPx036rJEpz7_bQyVLATNSXqrYF9ETMoJ-1LTDBE6mNf7OjNVfKirVkPGvhe7xhY6pxjSSu-_W11TJy_fiIEzdoqZdqwtnyyw6Pz8TfTFtjvluCytnPN4LGPLkJD2ucVbcOJjYZoqjoyHfgxaj7JaDtY9MODEnvj0XLzqYOaWNuwY1sxOY4bWpWB1NxjiketHUGitXFcoetNi2_nJjLdscfQPhDE1fJtU8jqpV65TKWRGJEhkHsGou9vh9UFO-bahYxn77I",
            },
            {
                id: "emerald",
                name: "Emerald Gardens Ph. II",
                sector: "West Valley",
                prefix: "Emerald House",
                buildings: 5,
                units: 64,
                water: "Optimal",
                heating: "Maintenance",
                health: 91.4,
                waterM3: 410,
                heatingM3: 290,
                pressurePsi: 54,
                extraDebt: 5140000,
                baselineCollected: 13250000,
                icon: "domain",
            },
            {
                id: "riverside",
                name: "Riverside Towers",
                sector: "South Ridge",
                prefix: "Riverside House",
                buildings: 6,
                units: 118,
                water: "Optimal",
                heating: "Optimal",
                health: 98.5,
                waterM3: 690,
                heatingM3: 430,
                pressurePsi: 56,
                extraDebt: 1780000,
                baselineCollected: 18420000,
                icon: "apartment",
            },
            {
                id: "metropolitan",
                name: "The Metropolitan",
                sector: "Central District",
                prefix: "Metro House",
                buildings: 9,
                units: 210,
                water: "Optimal",
                heating: "Optimal",
                health: 99,
                waterM3: 1050,
                heatingM3: 710,
                pressurePsi: 58,
                extraDebt: 1240000,
                baselineCollected: 22600000,
                icon: "location_city",
            },
        ],
        residents: [
            { id: "marcus", complexId: "skyline", name: "Marcus Aurelius", apartment: "Apartment 402-A", phone: "+1 415-555-0123", lastPayment: "14.04.2026", balance: -15630000, status: "debtor" },
            { id: "sarah", complexId: "skyline", name: "Sarah Jenkins", apartment: "Apartment 102-B", phone: "+1 415-555-0988", lastPayment: "01.04.2026", balance: 1890000, status: "paid", photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbul21XjuUtavoaA43cE0XfvjTcBr91Gwh0DOpQ60e1VpbG9WiUP8nIyuS6hOZaTI58jcHaeD0beX-E0rBSH1Bv_S808PuRszKqXJEh6Vq0locmQfgLTsjxYlH3ACUil6xGKUShKi_bNquTS3KicvI_tWfakVeCWoTyQLZIRjcGdvB4j6lF2L4-2tb_hyG8XObWSwUPRbiL-GwIoSPCverXsM6GCsCItbszp_mBHsX9WTWR2la-X6X0D28OGRHYwwryqQcTde3S3Q" },
            { id: "james", complexId: "emerald", name: "James Dalton", apartment: "Apartment 305-C", phone: "+1 415-555-4422", lastPayment: "28.03.2026", balance: 0, status: "paid" },
            { id: "david", complexId: "harbor", name: "David Miller", apartment: "Apartment 202-A", phone: "+1 415-555-7788", lastPayment: "22.03.2026", balance: -3026000, status: "debtor", photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAL2arW5TKtxXbLkugrUZ79szIf1un76ckgw1TibiTbry8qMg-hoddJMGDy3IQPtV_WOCrhYpJMQq1N4wNB0zo3b2luwimZLOL4QFzjrDOYbTTjyxkVk-pOF715nUWpa1GET5GfoOLc-VwYDwFA55lG6iot-7vIpOulR9bMmmZqP4ErMYCxsnI2gtM6RJ5gyTZpU_RdcOAU1AO2dI4qZ5TBSrUXoIQCaftTgTZNWR2HWk8drtk7a-DPMttLqYTZ0EtP3H3Q0u019zg" },
            { id: "nodira", complexId: "emerald", name: "Nodira Karimova", apartment: "Apartment 118-D", phone: "+1 415-555-2211", lastPayment: "12.04.2026", balance: 2640000, status: "paid", photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=160&q=80" },
            { id: "aziz", complexId: "harbor", name: "Aziz Rahmonov", apartment: "Apartment 509-F", phone: "+1 415-555-6619", lastPayment: "05.04.2026", balance: -1482000, status: "debtor", photo: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=160&q=80" },
            { id: "bekzod", complexId: "skyline", name: "Bekzod Usmanov", apartment: "Apartment 611-C", phone: "+998 90-555-1044", lastPayment: "15.04.2026", balance: 1240000, status: "paid", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80" },
            { id: "kamila", complexId: "harbor", name: "Kamila Akhmedova", apartment: "Apartment 407-B", phone: "+998 90-555-3099", lastPayment: "27.03.2026", balance: -2104000, status: "debtor", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80" },
        ],
        transactions: [
            { id: "inv-98234", residentId: "marcus", complexId: "skyline", type: "Utility Payment", method: "Payme", date: "14.04.2026", amount: 4349000, status: "Success" },
            { id: "inv-98235", residentId: "sarah", complexId: "skyline", type: "Maintenance Fee", method: "Payme", date: "01.04.2026", amount: 1890000, status: "Success" },
            { id: "inv-98236", residentId: "david", complexId: "harbor", type: "Late Penalty", method: "Click", date: "22.03.2026", amount: 567000, status: "Pending" },
            { id: "inv-98237", residentId: "nodira", complexId: "emerald", type: "Utility Payment", method: "Payme", date: "12.04.2026", amount: 2640000, status: "Success" },
            { id: "inv-98238", residentId: "aziz", complexId: "harbor", type: "Late Penalty", method: "Click", date: "05.04.2026", amount: 410000, status: "Pending" },
            { id: "inv-98239", residentId: "bekzod", complexId: "skyline", type: "Usage Payment", method: "Terminal", date: "15.04.2026", amount: 1240000, status: "Success" },
            { id: "inv-98240", residentId: "kamila", complexId: "harbor", type: "Late Penalty", method: "Click", date: "27.03.2026", amount: 390000, status: "Pending" },
            { id: "inv-98241", residentId: "james", complexId: "emerald", type: "Utility Payment", method: "Terminal", date: "28.03.2026", amount: 1120000, status: "Success" },
        ],
        notifications: [],
        systemAlerts: [],
        maintenanceTasks: [],
        auditEvents: [],
        checklistItems: [],
        checklistNotes: [],
        telemetryNodes: [],
        pressureSeries: [],
        profile: {},
    };

    const applyBackendBillingData = (payload) => {
        if (!payload || !Array.isArray(payload.complexes) || !Array.isArray(payload.residents) || !Array.isArray(payload.transactions)) {
            return false;
        }
        billingData.complexes.splice(0, billingData.complexes.length, ...payload.complexes);
        billingData.residents.splice(0, billingData.residents.length, ...payload.residents);
        billingData.transactions.splice(0, billingData.transactions.length, ...payload.transactions);
        ["notifications", "systemAlerts", "maintenanceTasks", "auditEvents", "checklistItems", "checklistNotes", "telemetryNodes", "pressureSeries"].forEach((key) => {
            billingData[key] = Array.isArray(payload[key]) ? payload[key] : [];
        });
        billingData.profile = payload.profile && typeof payload.profile === "object" ? payload.profile : {};
        billingData.source = payload.source || "backend";
        billingData.generatedAt = payload.generatedAt || "";
        return true;
    };

    applyBackendBillingData(window.HydroFlowBackendData);
    window.HydroFlowApplyBackendData = applyBackendBillingData;

    const renderBackendProfile = () => {
        const profile = billingData.profile || {};
        const fallbackName = profile.username || "Admin";
        const values = {
            name: profile.name || fallbackName,
            initials: profile.initials || fallbackName.slice(0, 2).toUpperCase(),
            role: profile.role || "Operator",
            email: profile.email || "No email in admin",
            status: profile.status || "Active",
            workspace: profile.workspace || "Mirabad Avenue",
            organization: profile.organization || "Mirabad Avenue",
            accessLevel: profile.accessLevel || "Staff access",
            timezone: profile.timezone || "Asia/Tashkent",
            lastActive: profile.lastActive || billingData.generatedAt || "Backend session",
            twoFactor: profile.twoFactor || "Disabled",
            sessionStatus: profile.sessionStatus || "Active",
            note: profile.note || "Profile data is loaded from Django admin.",
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
            water: complexes.some((complex) => complex.water !== "Optimal") ? "Review" : "Optimal",
            heating: complexes.some((complex) => complex.heating !== "Optimal") ? "Review" : "Optimal",
            health: Math.round(weightedHealth * 10) / 10,
            waterM3: complexes.reduce((total, complex) => total + (Number(complex.waterM3) || 0), 0),
            heatingM3: complexes.reduce((total, complex) => total + (Number(complex.heatingM3) || 0), 0),
            pressurePsi: 0,
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
    const getMonthlyTransactionStats = () => {
        const months = ["Jan", "Feb", "Mar", "Apr"];
        const map = Object.fromEntries(months.map((month) => [month, { success: 0, pending: 0, total: 0 }]));
        billingData.transactions.forEach((transaction) => {
            const [day, month] = transaction.date.split(".").map(Number);
            const label = months[(month || 1) - 1];
            if (!map[label]) return;
            map[label].total += transaction.amount;
            if (transaction.status === "Success") map[label].success += transaction.amount;
            else map[label].pending += transaction.amount;
        });
        return { labels: months, values: months.map((month) => map[month]) };
    };
    const getSiteStats = () => {
        const complexes = getComplexStats();
        const totalComplexes = complexes.length;
        const totalBuildings = complexes.reduce((total, complex) => total + complex.buildings, 0);
        const totalUnits = complexes.reduce((total, complex) => total + complex.units, 0);
        const occupiedUnits = complexes.reduce((total, complex) => total + Math.round(complex.units * Math.min(0.995, 0.86 + (complex.health / 1000))), 0);
        const totalCollected = complexes.reduce((total, complex) => total + complex.collected, 0);
        const totalDebt = complexes.reduce((total, complex) => total + complex.debt, 0);
        const detailedDebt = billingData.residents.reduce((total, resident) => total + (resident.balance < 0 ? Math.abs(resident.balance) : 0), 0);
        const transactionVolume = billingData.transactions.reduce((total, transaction) => total + transaction.amount, 0);
        const methodTotals = billingData.transactions.reduce((totals, transaction) => {
            totals[transaction.method] = (totals[transaction.method] || 0) + transaction.amount;
            return totals;
        }, {});
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
        const activeAlerts = backendAlerts.length || billingData.complexes.filter((complex) => complex.water !== "Optimal" || complex.heating !== "Optimal").length;
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
        const avgPressure = billingData.complexes.reduce((total, complex) => total + complex.pressurePsi, 0) / Math.max(totalComplexes, 1);
        return {
            complexes,
            totalComplexes,
            totalBuildings,
            totalUnits,
            occupiedUnits,
            occupancyRate: (occupiedUnits / Math.max(totalUnits, 1)) * 100,
            totalCollected,
            totalDebt,
            detailedDebt,
            transactionVolume,
            methodTotals,
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
            avgPressure,
            detailedResidents,
            detailedPaidResidents,
            detailedDebtors,
            pendingTransactions: billingData.transactions.filter((transaction) => transaction.status !== "Success").length,
            successfulTransactions: billingData.transactions.filter((transaction) => transaction.status === "Success").length,
            sectors: 1,
        };
    };

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
    const normalizeFilterState = () => ({ ...defaultFilterState });
    const readFilterState = () => ({ ...defaultFilterState });
    const writeFilterState = () => {};
    const withinFilterPeriod = () => true;
    const filterMatchesComplex = () => true;
    const filterMatchesResident = (resident) => Boolean(resident);
    const filterMatchesTransaction = () => true;

    const fakeData = {
        complexes: Object.fromEntries(getComplexStats().map((complex) => [complex.name, {
            subtitle: `${complex.sector} · ${complex.units} units`,
            status: complex.risk === "Critical" ? "Critical" : complex.risk === "Medium Risk" ? "Maintenance" : "Operational",
            debt: formatBillingUzs(complex.debt),
            lastPayment: (complex.transactions.slice().sort((a, b) => dateValue(b.date) - dateValue(a.date))[0]?.date) || "13.04.2026",
            health: `${complex.health}%`,
            alerts: complex.risk === "Critical" ? "Water leak alert" : complex.risk === "Medium Risk" ? "Heating maintenance pending" : "No critical alerts",
            owner: complex.risk === "Critical" ? "Billing Ops" : "Operations Team",
            technician: complex.risk === "Critical" ? "Unassigned" : "Aziz Karimov",
            sla: complex.risk === "Critical" ? "42m" : "2h 15m",
        }])),
    };

    window.HydroFlowBillingData = billingData;
    window.HydroFlowMockData = fakeData;

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

    const tone = ({ frequency = 520, endFrequency = null, duration = 0.055, delay = 0, volume = 0.035, type = "sine" } = {}) => {
        const context = getAudioContext();
        if (!context) return;
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

    const applyLanguage = (lang) => {
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
        document.dispatchEvent(new CustomEvent("hydroflow:language-changed", { detail: { lang: safeLang } }));
    };

    window.HydroFlowApplyLanguage = applyLanguage;
    window.HydroFlowSyncLocale = () => applyLanguage(storage.getItem("hydroflow-lang") || "en");

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
        playSound(target.dataset.soundKind || "click");
    }, true);

    document.addEventListener("pointerenter", (event) => {
        const target = event.target.closest?.(".sidebar-link, .topbar-action-button, .theme-toggle, .lang-toggle, .drawer-action, .settings-primary-action, .account-avatar-trigger, .account-menu-item, .resident-filter-button, .network-filter, .debtor-primary-action, [data-sound-hover]");
        if (!target) return;
        playSound("hover");
    }, true);

    const searchSoundSelector = "input[type='search'], [data-command-input], [data-command-open], [data-resident-search], .table-search";
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
    const mobileBackdrop = document.querySelector("[data-mobile-sidebar-backdrop]");
    const openSidebar = () => {
        sidebar?.classList.add("is-open");
        mobileBackdrop?.classList.remove("hidden");
    };
    const closeSidebar = () => {
        sidebar?.classList.remove("is-open");
        mobileBackdrop?.classList.add("hidden");
    };

    document.querySelector("[data-sidebar-open]")?.addEventListener("click", openSidebar);
    mobileBackdrop?.addEventListener("click", closeSidebar);
    document.querySelectorAll("[data-sidebar] a").forEach((link) => link.addEventListener("click", closeSidebar));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeSidebar();
    });

    const detailsDrawer = document.getElementById("details-drawer");
    const statusDotClass = (status) => {
        const value = String(status || "").toLowerCase();
        if (value.includes("critical") || value.includes("alert") || value.includes("overdue")) return "dot-critical";
        if (value.includes("maintenance") || value.includes("pending") || value.includes("warning") || value.includes("review")) return "dot-warning";
        if (value.includes("info")) return "dot-info";
        return "dot-operational";
    };

    const fillDetails = (data) => {
        if (!detailsDrawer || !data) return;
        window.HydroFlowSyncLocale?.();
        detailsDrawer.dataset.ownerBackendId = data.ownerBackendId || "";
        detailsDrawer.dataset.apartmentBackendId = data.apartmentBackendId || "";
        detailsDrawer.dataset.buildingBackendId = data.buildingBackendId || "";
        detailsDrawer.dataset.complexBackendId = data.complexBackendId || "";
        detailsDrawer.dataset.alertBackendId = data.alertBackendId || "";
        detailsDrawer.dataset.maintenanceBackendId = data.maintenanceBackendId || "";
        detailsDrawer.dataset.notificationBackendId = data.notificationBackendId || "";
        detailsDrawer.querySelector("#details-title").textContent = data.title;
        detailsDrawer.querySelector("[data-detail-subtitle]").textContent = data.subtitle;
        detailsDrawer.querySelector("[data-detail-status]").textContent = data.status;
        detailsDrawer.querySelector("[data-detail-status-label]").textContent = data.status;
        detailsDrawer.querySelector("[data-detail-debt]").textContent = data.debt;
        detailsDrawer.querySelector("[data-detail-payment]").textContent = data.lastPayment;
        detailsDrawer.querySelector("[data-detail-health]").textContent = data.health;
        detailsDrawer.querySelector("[data-detail-alert]").textContent = data.alerts;
        detailsDrawer.querySelector("[data-detail-owner]").textContent = data.owner || "Operations Team";
        detailsDrawer.querySelector("[data-detail-tech]").textContent = data.technician || "Unassigned";
        detailsDrawer.querySelector("[data-detail-sla]").textContent = data.sla || "2h 15m";
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
            technician: "Billing Team",
            sla: isDebtor ? "24h" : "Closed",
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
        return {
            title: complex.name,
            subtitle: `${complex.sector} · ${complex.units} units`,
            status: complex.risk === "Critical" ? "Critical" : complex.risk === "Medium Risk" ? "Maintenance" : "Operational",
            debt: formatBillingUzs(complex.debt),
            lastPayment: latest?.date || "13.04.2026",
            health: `${complex.health}%`,
            alerts: complex.risk === "Critical" ? "Water leak alert" : complex.risk === "Medium Risk" ? "Heating maintenance pending" : "No critical alerts",
            owner: "Operations Team",
            technician: complex.risk === "Critical" ? "Unassigned" : "Aziz Karimov",
            sla: complex.risk === "Critical" ? "42m" : "2h 15m",
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
                    technician: transaction.method,
                    sla: transaction.status === "Pending" ? "12h" : "Closed",
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
        const rowTitle = row?.querySelector("p.font-bold")?.textContent?.trim();
        return fakeData.complexes[rowTitle] ? { title: rowTitle, ...fakeData.complexes[rowTitle] } : null;
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

    confirmModal?.querySelector("[data-confirm-submit]")?.addEventListener("click", () => {
        const target = confirmTarget;
        confirmModal.classList.add("hidden");
        confirmModal.classList.remove("flex", "is-open");
        confirmModal.setAttribute("aria-hidden", "true");
        if (!target) return;
        target.dataset.confirmed = "true";
        if (target.dataset.confirmAction === "close-critical-alert") {
            const item = target.closest(".notification-item");
            if (item) {
                item.dataset.read = "true";
                item.classList.remove("critical-pulse");
                item.classList.add("opacity-60");
            }
            const lang = storage.getItem("hydroflow-lang") || "en";
            toast(translateValue("Alert closed", lang), "The critical alert was moved to the audit timeline.", "warning");
            updateNotifications();
        } else {
            target.click();
        }
        window.setTimeout(() => {
            target.dataset.confirmed = "false";
            confirmTarget = null;
        }, 0);
    });

    const pinnedNotificationKey = "hydroflow-pinned-notifications";
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
            button.setAttribute("aria-label", pinned ? "Unpin notification" : "Pin notification");
            const icon = button.querySelector(".material-symbols-outlined");
            const label = button.querySelector(".notification-pin-label");
            if (icon) icon.textContent = pinned ? "keep_off" : "keep";
            if (label) label.textContent = pinned ? "Pinned" : "Pin";
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

    const renderBackendNotifications = () => {
        const list = document.querySelector("[data-notification-list]");
        const notifications = Array.isArray(billingData.notifications) ? billingData.notifications : [];
        if (!list || list.dataset.backendNotificationsRendered === "true") return;
        if (list.dataset.serverList === "alerts") return;
        if (!notifications.length && !billingData.source) return;
        const groupLabel = (key, label, hidden = false) => `<div class="notification-group-label ${hidden ? "hidden" : ""}" data-notification-group="${key}">${label}</div>`;
        const severityLabel = (severity) => severity === "critical" ? "Critical" : severity === "warning" ? "Warning" : "Info";
        const actionButtons = (item) => {
            const primary = item.actionPrimary || (item.severity === "critical" ? "Assign technician" : "Details");
            const secondary = item.actionSecondary || (item.severity === "critical" ? "Close alert" : "");
            return `
                <div class="mt-3 flex gap-2">
                    <button class="drawer-action ${item.severity === "critical" ? "bg-error" : "bg-primary"} text-white" ${item.severity === "critical" ? `data-assign-technician data-notification-backend-id="${escapeHtml(item.backendId || "")}"` : `data-notification-action="${escapeHtml(item.actionState || `${primary} queued`)}"`} type="button">${escapeHtml(primary)}</button>
                    ${secondary ? `<button class="drawer-action bg-surface-container text-primary" ${item.severity === "critical" ? 'data-confirm-action="close-critical-alert"' : `data-notification-action="${escapeHtml(`${secondary} queued`)}"`} type="button">${escapeHtml(secondary)}</button>` : ""}
                </div>
            `;
        };
        const renderItem = (item) => {
            const severity = ["critical", "warning", "info"].includes(item.severity) ? item.severity : "info";
            return `
                <div class="notification-item ${severity === "critical" ? "critical-pulse" : ""}"
                    data-notification-id="${escapeHtml(item.id)}"
                    data-notification-backend-id="${escapeHtml(item.backendId || "")}"
                    data-notification-section="${escapeHtml(item.section || "today")}"
                    data-read="${item.read ? "true" : "false"}"
                    data-pinned="${item.pinned ? "true" : "false"}"
                    data-severity="${escapeHtml(severity)}">
                    <div class="notification-card-head">
                        <p class="severity-badge severity-${escapeHtml(severity)}"><span class="status-dot dot-${severity === "critical" ? "critical" : severity === "warning" ? "warning" : "info"}"></span>${severityLabel(severity)}</p>
                        <div class="notification-card-meta">
                            <time class="text-[10px] text-on-surface-variant">${escapeHtml(item.eventAt || "")}</time>
                            <button aria-label="Pin notification" aria-pressed="${item.pinned ? "true" : "false"}" class="notification-pin" data-notification-pin type="button"><span class="material-symbols-outlined">${item.pinned ? "keep_off" : "keep"}</span><span class="notification-pin-label">${item.pinned ? "Pinned" : "Pin"}</span></button>
                        </div>
                    </div>
                    <p class="text-sm font-bold text-on-surface mt-2">${escapeHtml(item.title)}</p>
                    <p class="text-xs text-on-surface-variant mt-1">${escapeHtml(item.message || "")}</p>
                    <p class="notification-action-state ${item.actionState ? "" : "hidden"}" data-notification-state>${escapeHtml(item.actionState || "")}</p>
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
            `<div class="empty-state ${notifications.length ? "hidden" : ""}" data-notification-empty><span class="material-symbols-outlined">notifications_off</span><div><p>No hidden alerts</p><span>Resolved notifications are moved to the activity log.</span></div></div>`,
        ].join("");
        list.dataset.backendNotificationsRendered = "true";
    };

    const updateNotifications = () => {
        const items = Array.from(document.querySelectorAll("[data-notification-list] .notification-item"));
        const list = document.querySelector("[data-notification-list]");
        const pinnedIds = getPinnedNotificationIds();
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
        const unread = items.filter((item) => item.dataset.read !== "true").length;
        const lang = storage.getItem("hydroflow-lang") || "en";
        const unreadLabel = lang === "ru" ? `${unread} непрочитанных` : lang === "uz" ? `${unread} ta o'qilmagan` : `${unread} unread`;
        document.querySelector("[data-notification-count]")?.replaceChildren(document.createTextNode(unreadLabel));
        document.querySelectorAll("[data-notification-dot]").forEach((dot) => {
            dot.classList.toggle("hidden", unread === 0);
        });
        document.querySelectorAll("[data-sidebar-notification-item]").forEach((item) => {
            item.classList.toggle("is-unread", unread > 0);
        });
        const activeFilter = document.querySelector("[data-notification-filter].is-active")?.dataset.notificationFilter || "all";
        let visible = 0;
        items.forEach((item) => {
            const show = activeFilter === "all" || item.dataset.severity === activeFilter;
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
        const stats = getSiteStats();
        const t = (key) => translateValue(key, storage.getItem("hydroflow-lang") || "en");
        const labelVariants = (text) => [text, translations[text]?.ru, translations[text]?.uz].filter(Boolean).map((item) => item.toLowerCase());
        const statHostSelector = ".residential-kpi-card, .payment-channel, .debtor-trends-card, .bg-primary-container, [data-card], .bg-surface-container-lowest, .bg-surface-container-low";
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
        const detailedPaid = billingData.transactions
            .filter((transaction) => transaction.status === "Success")
            .reduce((total, transaction) => total + transaction.amount, 0);
        const detailedCollectionRate = (detailedPaid / Math.max(detailedPaid + stats.detailedDebt, 1)) * 100;

        setStat("Total Residents", moneyFormatter.format(stats.detailedResidents), t("Total linked resident profiles"));
        setStat("Paid Residents", moneyFormatter.format(stats.detailedPaidResidents), t("Residents with positive or zero balance"));
        setStat("Total Debtors", moneyFormatter.format(stats.detailedDebtors), t("Residents with overdue balance"));
        setStat("Outstanding Debt", formatCompactUzs(stats.detailedDebt), t("Current resident liabilities"));
        setStat("Total Complexes", moneyFormatter.format(stats.totalComplexes), t("All homes connected"));
        setStat("Active Buildings", moneyFormatter.format(stats.totalBuildings), `${moneyFormatter.format(stats.totalUnits)} active units`);
        setStat("Occupancy Rate", percentValue(stats.occupancyRate), `Across ${stats.totalBuildings} buildings`, stats.occupancyRate);
        setStat("Critical Debt Units", moneyFormatter.format(stats.criticalDebtUnits), `${stats.totalDebtorUnits} debt units total`);
        setStat("Total Units", moneyFormatter.format(stats.totalUnits));
        setStat("Total Subscribers", moneyFormatter.format(stats.occupiedUnits));
        setStat("Total YTD Payments", formatBillingUzs(stats.totalCollected));
        setStat("Total Debt Burden", formatBillingUzs(stats.totalDebt));
        setStat("Overall System Efficiency", percentValue(stats.weightedHealth), "", stats.weightedHealth);
        setStat("Active Alerts", `${stats.activeAlerts} Minor`, `${stats.criticalAlerts} critical tasks pending`);
        setStat("Water Pressure Status", stats.avgPressure < 50 ? "Review" : "Stable");
        setStat("Heating Core Temp", stats.warningComplexes.some((complex) => complex.heating !== "Optimal") ? "Maintenance" : "Optimal");
        setStat("Active Debtors", `${stats.detailedDebtors} residents`, `${stats.pendingTransactions} pending transaction records`);
        setStat("Total Outstanding", formatBillingUzs(stats.detailedDebt), `${formatBillingUzs(detailedPaid)} collected in log`);
        setStat("Collection Rate", percentValue(detailedCollectionRate), "", detailedCollectionRate);
        setStat("Total Complex Usage", `${compactNumber(stats.totalUsageM3)} m³`, `${moneyFormatter.format(stats.totalWaterM3)} water / ${moneyFormatter.format(stats.totalHeatingM3)} heating`);

        const billingHeader = document.querySelector("main header p.text-on-surface-variant");
        if (billingHeader?.textContent.includes("Managing")) {
            billingHeader.textContent = `Managing ${stats.detailedResidents} linked residents across ${stats.totalUnits} units.`;
        }

        const statusBanner = Array.from(document.querySelectorAll("span.text-sm.font-semibold")).find((element) => element.textContent.includes("All Systems"));
        if (statusBanner) statusBanner.textContent = stats.criticalAlerts ? "System Review Required" : "All Systems Operational";

        document.querySelectorAll(".network-filter").forEach((button) => {
            const strong = button.querySelector("strong");
            if (!strong) return;
            const backendNodes = Array.isArray(billingData.telemetryNodes) ? billingData.telemetryNodes : [];
            const nodeTotal = backendNodes.length || stats.totalComplexes;
            const nodeIssues = backendNodes.length ? backendNodes.filter((node) => ["issue", "offline"].includes(node.status)).length : stats.activeAlerts;
            if (button.dataset.networkFilter === "all") strong.textContent = nodeTotal;
            if (button.dataset.networkFilter === "online") strong.textContent = Math.max(0, nodeTotal - nodeIssues);
            if (button.dataset.networkFilter === "issue") strong.textContent = nodeIssues;
        });

        const backendIssueAlerts = Array.isArray(billingData.systemAlerts)
            ? billingData.systemAlerts.filter((alert) => !["resolved", "archived"].includes(String(alert.status || "").toLowerCase()))
            : [];
        const issueAlerts = backendIssueAlerts.length ? backendIssueAlerts.map((alert) => ({
            id: alert.id,
            severity: alert.severity || "warning",
            icon: alert.icon || "warning",
            title: alert.title,
            subtitle: alert.subtitle || alert.message || "",
            meta: alert.meta || alert.detectedAt || "",
        })) : stats.complexes.flatMap((complex) => {
            const alerts = [];
            if (complex.water !== "Optimal") {
                alerts.push({
                    id: `${complex.id}-water`,
                    severity: "critical",
                    icon: "leak_add",
                    title: "Water issue detected",
                    subtitle: `${complex.name} · ${complex.sector}`,
                    meta: `${complex.water} · ${moneyFormatter.format(complex.pressurePsi)} PSI`,
                });
            }
            if (complex.heating !== "Optimal") {
                alerts.push({
                    id: `${complex.id}-heating`,
                    severity: complex.heating === "Maintenance" ? "warning" : "critical",
                    icon: "device_thermostat",
                    title: "Heating maintenance required",
                    subtitle: `${complex.name} · ${complex.sector}`,
                    meta: `${complex.heating} · ${moneyFormatter.format(complex.heatingM3)} m³/day`,
                });
            }
            return alerts;
        });
        const derivedMaintenanceTasks = stats.complexes.flatMap((complex, index) => {
            const tasks = [];
            if (complex.water !== "Optimal") {
                tasks.push({
                    id: `${complex.id}-water-maintenance`,
                    complexId: complex.id,
                    task: "Water leak inspection",
                    location: `${complex.name} · main line`,
                    priority: "High",
                    date: "20.04.2026 | 10:30",
                    status: "Upcoming",
                    action: "Assign technician",
                    icon: "plumbing",
                    day: "20",
                    month: "APR",
                    tone: "error",
                });
            }
            if (complex.heating !== "Optimal") {
                tasks.push({
                    id: `${complex.id}-heating-maintenance`,
                    complexId: complex.id,
                    task: "Heating loop service",
                    location: `${complex.name} · heating core`,
                    priority: "Medium",
                    date: "24.04.2026 | 09:00",
                    status: "Scheduled",
                    action: "Open checklist",
                    icon: "device_thermostat",
                    day: "24",
                    month: "APR",
                    tone: "tertiary",
                });
            }
            if (index < 2 && complex.water === "Optimal" && complex.heating === "Optimal") {
                tasks.push({
                    id: `${complex.id}-audit-maintenance`,
                    complexId: complex.id,
                    task: "Preventive system audit",
                    location: `${complex.name} · ${complex.sector}`,
                    priority: "Low",
                    date: `${String(26 + index).padStart(2, "0")}.04.2026 | ${index ? "14:00" : "11:15"}`,
                    status: "Planned",
                    action: "View plan",
                    icon: "fact_check",
                    day: String(26 + index),
                    month: "APR",
                    tone: "secondary",
                });
            }
            return tasks;
        }).slice(0, 5);
        const backendMaintenanceTasks = Array.isArray(billingData.maintenanceTasks)
            ? billingData.maintenanceTasks.filter((task) => task.statusKey !== "completed")
            : [];
        const maintenanceTasks = backendMaintenanceTasks.length ? backendMaintenanceTasks : derivedMaintenanceTasks;
        const badgeClass = (tone) => tone === "error"
            ? "bg-error-container text-error"
            : tone === "tertiary"
            ? "bg-tertiary-fixed text-on-tertiary-fixed"
            : "bg-secondary-container text-on-secondary-container";

        const systemCriticalSection = Array.from(document.querySelectorAll("section"))
            .find((section) => section.querySelector("h4")?.textContent.toLowerCase().includes("critical alerts"));
        if (systemCriticalSection) {
            const alertBody = systemCriticalSection.querySelector(".divide-y");
            const actionBadge = systemCriticalSection.querySelector("h4 + *");
            if (actionBadge) {
                actionBadge.textContent = issueAlerts.length ? "ACT NOW" : "CLEAR";
                actionBadge.setAttribute("type", "button");
                actionBadge.dataset.modalOpen = "system-alerts-config-modal";
            }
            if (alertBody) {
                alertBody.innerHTML = issueAlerts.length
                    ? issueAlerts.slice(0, 3).map((alert) => {
                        const tone = alert.severity === "critical" ? "error" : "tertiary";
                        return `
                            <button
                                class="w-full p-4 flex gap-3 text-left transition-colors hover:bg-surface-container-low"
                                data-system-alert-link
                                data-system-alert="${escapeHtml(alert.id)}"
                                data-admin-url="${escapeHtml(alert.adminUrl || `/admin/portal/systemalert/${alert.backendId}/change/`)}"
                                type="button">
                                <div class="w-8 h-8 rounded-full bg-${tone}-container flex-shrink-0 flex items-center justify-center text-${tone}">
                                    <span class="material-symbols-outlined text-base">${escapeHtml(alert.icon)}</span>
                                </div>
                                <div>
                                    <p class="text-xs font-bold text-on-surface">${escapeHtml(alert.title)}</p>
                                    <p class="text-[10px] text-on-surface-variant">${escapeHtml(alert.subtitle)}</p>
                                    <p class="text-[10px] text-${tone} font-semibold mt-1">${escapeHtml(alert.meta)}</p>
                                </div>
                            </button>
                        `;
                    }).join("")
                    : `
                        <div class="p-4 flex gap-3">
                            <div class="w-8 h-8 rounded-full bg-secondary-container flex-shrink-0 flex items-center justify-center text-secondary">
                                <span class="material-symbols-outlined text-base">check_circle</span>
                            </div>
                            <div>
                                <p class="text-xs font-bold text-on-surface">No critical alerts</p>
                                <p class="text-[10px] text-on-surface-variant">All complexes are operating inside the current local telemetry range.</p>
                            </div>
                        </div>
                    `;
            }
            const viewAlertsButton = systemCriticalSection.querySelector("button");
            if (viewAlertsButton) {
                viewAlertsButton.type = "button";
                viewAlertsButton.dataset.modalOpen = "notifications-drawer";
            }
        }

        const maintenancePanel = document.querySelector("[data-card='upcoming-maintenance']");
        if (maintenancePanel) {
            const list = maintenancePanel.querySelector(".space-y-6");
            if (list) {
                list.innerHTML = maintenanceTasks.slice(0, 3).map((task, index) => `
                    <button
                        class="w-full flex gap-4 text-left rounded-xl p-2 -mx-2 transition-colors hover:bg-surface-container-low"
                        data-maintenance-widget-item
                        data-maintenance-id="${escapeHtml(task.id || task.backendId || task.task)}"
                        data-admin-url="${escapeHtml(task.adminUrl || `/admin/portal/maintenancetask/${task.backendId}/change/`)}"
                        type="button">
                        <div class="flex flex-col items-center ${index > 0 ? "opacity-70" : ""}">
                            <span class="text-[10px] font-bold text-on-surface-variant uppercase">${escapeHtml(task.month)}</span>
                            <span class="text-lg font-black text-primary leading-none">${escapeHtml(task.day)}</span>
                        </div>
                        <div class="h-10 w-[2px] bg-primary/${index ? "10" : "20"}"></div>
                        <div>
                            <p class="text-xs font-bold text-on-surface">${escapeHtml(task.task)}</p>
                            <p class="text-[10px] text-on-surface-variant">${escapeHtml(task.location)} · ${escapeHtml(task.date.split("|")[1]?.trim() || "")}</p>
                            <span class="text-[9px] px-2 py-0.5 ${badgeClass(task.tone)} font-bold rounded mt-1 inline-block uppercase" data-status="${escapeHtml(task.status.toLowerCase())}">${escapeHtml(task.status)}</span>
                        </div>
                    </button>
                `).join("");
            }
        }

        const maintenanceBody = document.querySelector("[data-maintenance-body]");
        if (maintenanceBody) {
            const priorityKey = (task) => String(task.priorityKey || task.priority || "").toLowerCase();
            const statusKey = (task) => String(task.statusKey || task.status || "").toLowerCase();
            const statusClass = (task) => {
                const key = statusKey(task);
                if (key.includes("planned") || key.includes("pending")) return "is-warning";
                if (key.includes("progress") || key.includes("scheduled") || key.includes("upcoming")) return "is-info";
                if (key.includes("complete") || key.includes("done")) return "is-success";
                return "is-success";
            };
            maintenanceBody.innerHTML = maintenanceTasks.length ? maintenanceTasks.map((task) => `
                <tr class="maintenance-log-row hover:bg-surface-container-low transition-colors group"
                    data-maintenance-row
                    data-maintenance-id="${escapeHtml(task.id || task.backendId || task.task)}"
                    data-complex-id="${escapeHtml(task.complexId || "")}"
                    data-building-id="${escapeHtml(task.buildingId || "")}"
                    data-priority="${escapeHtml(priorityKey(task))}"
                    data-status-key="${escapeHtml(statusKey(task))}"
                    data-admin-url="${escapeHtml(task.adminUrl || `/admin/portal/maintenancetask/${task.backendId}/change/`)}"
                    data-date="${escapeHtml(task.date || "")}">
                    <td class="px-5 py-4">
                        <div class="flex items-center gap-3">
                            <div class="maintenance-task-icon">
                                <span class="material-symbols-outlined">${escapeHtml(task.icon)}</span>
                            </div>
                            <span class="maintenance-task-title">${escapeHtml(task.task)}</span>
                        </div>
                    </td>
                    <td class="px-5 py-4 text-sm text-on-surface-variant">${escapeHtml(task.location)}</td>
                    <td class="px-5 py-4 whitespace-nowrap"><span class="table-assigned-status ${priorityKey(task) === "high" ? "is-critical" : priorityKey(task) === "medium" ? "is-warning" : "is-success"}">${escapeHtml(task.priority)}</span></td>
                    <td class="px-5 py-4 text-sm text-on-surface whitespace-nowrap">${escapeHtml(task.date)}</td>
                    <td class="px-5 py-4 whitespace-nowrap"><span class="table-assigned-status ${statusClass(task)}">${escapeHtml(task.status)}</span></td>
                    <td class="px-5 py-4 text-right whitespace-nowrap"><button class="maintenance-action-button" data-maintenance-action type="button">${escapeHtml(task.action)}</button></td>
                </tr>
            `).join("") : `
                <tr data-smart-empty="true">
                    <td class="px-6 py-8 text-sm text-on-surface-variant" colspan="7">No maintenance tasks found.</td>
                </tr>
            `;
            const maintenanceTable = maintenanceBody.closest("table");
            maintenanceTable?.HydroFlowRefreshTableControls?.();
        }

        const networkMap = document.querySelector("[data-network-map]");
        const networkLayer = networkMap?.querySelector("[data-network-layer]");
        if (networkMap && networkLayer) {
            const positions = [
                { x: 20, y: 22 },
                { x: 47, y: 38 },
                { x: 13, y: 61 },
                { x: 68, y: 69 },
                { x: 88, y: 35 },
                { x: 35, y: 73 },
                { x: 78, y: 20 },
            ];
            const activeFilter = networkMap.querySelector("[data-network-filter].is-active")?.dataset.networkFilter || "all";
            const backendNodes = Array.isArray(billingData.telemetryNodes) ? billingData.telemetryNodes : [];
            const nodeData = backendNodes.length ? backendNodes.map((node, index) => {
                const status = ["issue", "offline"].includes(node.status) ? "issue" : "online";
                return {
                    complex: {
                        id: node.id,
                        name: node.title,
                        sector: node.subtitle,
                        units: node.units || 0,
                        icon: node.icon || "apartment",
                        pressurePsi: Number(node.pressurePsi) || 0,
                        waterM3: (Number(node.flowLitersDay) || 0) / 1000,
                        heatingM3: 0,
                        health: Number(node.uptimePercent) || 100,
                        nodeTelemetry: node,
                    },
                    status,
                    pos: { x: Number(node.x) || positions[index % positions.length].x, y: Number(node.y) || positions[index % positions.length].y },
                };
            }) : stats.complexes.map((complex, index) => {
                const status = complex.water !== "Optimal" || complex.heating !== "Optimal" ? "issue" : "online";
                const pos = positions[index % positions.length];
                return { complex, status, pos };
            });
            const pipePath = (a, b) => {
                const cx = ((a.x + b.x) / 2).toFixed(1);
                return `M${a.x} ${a.y} C${cx} ${a.y} ${cx} ${b.y} ${b.x} ${b.y}`;
            };
            const pipesMarkup = nodeData.slice(1).map((item, index) => {
                const previous = nodeData[index];
                const issue = item.status === "issue" || previous.status === "issue";
                return `<path class="network-pipe ${issue ? "is-issue" : "is-online"}" data-route="${escapeHtml(previous.complex.id)}-${escapeHtml(item.complex.id)}" d="${pipePath(previous.pos, item.pos)}"></path>`;
            }).join("");
            networkLayer.innerHTML = `
                <svg class="network-pipes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${pipesMarkup}</svg>
                ${nodeData.map((item, index) => {
                    const { complex, status, pos } = item;
                    const routes = [
                        index > 0 ? `${nodeData[index - 1].complex.id}-${complex.id}` : "",
                        index < nodeData.length - 1 ? `${complex.id}-${nodeData[index + 1].complex.id}` : "",
                    ].filter(Boolean).join(" ");
                    const telemetry = complex.nodeTelemetry;
                    const flow = telemetry?.flow || `${compactNumber((complex.waterM3 + complex.heatingM3) * 1000)} l/day`;
                    const uptime = telemetry?.uptime || percentValue(Math.min(99.99, 94 + complex.health / 20));
                    const hidden = activeFilter === "issue" ? status !== "issue" : activeFilter === "online" ? status === "issue" : false;
                    return `
                        <button class="network-node ${status === "issue" ? "is-issue" : "is-online"} ${index === 0 ? "is-selected" : ""} ${hidden ? "is-hidden" : ""}"
                            style="--x:${pos.x}%; --y:${pos.y}%;"
                            data-node="${escapeHtml(complex.id)}"
                            data-status="${escapeHtml(status)}"
                            data-route="${escapeHtml(routes)}"
                            data-title="${escapeHtml(complex.name)}"
                            data-subtitle="${escapeHtml(telemetry?.subtitle || `${complex.sector} · ${moneyFormatter.format(complex.units)} units`)}"
                            data-pressure="${escapeHtml(telemetry?.pressure || `${moneyFormatter.format(complex.pressurePsi)} PSI`)}"
                            data-flow="${escapeHtml(flow)}"
                            data-latency="${escapeHtml(telemetry?.latency || `${moneyFormatter.format(Math.max(12, Math.round(95 - complex.health)))}ms`)}"
                            data-uptime="${escapeHtml(uptime)}"
                            type="button"
                            aria-label="${escapeHtml(complex.name)} network node">
                            <span class="network-node-icon material-symbols-outlined">${escapeHtml(complex.icon || "apartment")}</span>
                            <span class="network-node-label">${escapeHtml(complex.name.replace(/\s+(Residential|Gardens|Towers|Heights|Metropolitan).*/i, ""))}</span>
                        </button>
                    `;
                }).join("")}
            `;
            const detail = {
                status: networkMap.querySelector("[data-network-detail-status]"),
                time: networkMap.querySelector(".network-detail-time"),
                title: networkMap.querySelector("[data-network-detail-title]"),
                subtitle: networkMap.querySelector("[data-network-detail-subtitle]"),
                pressure: networkMap.querySelector("[data-network-detail-pressure]"),
                flow: networkMap.querySelector("[data-network-detail-flow]"),
                latency: networkMap.querySelector("[data-network-detail-latency]"),
                uptime: networkMap.querySelector("[data-network-detail-uptime]"),
                uptimeMeter: networkMap.querySelector("[data-network-detail-uptime-meter]"),
                action: networkMap.querySelector(".network-detail-action"),
            };
            const clearNetworkDetail = (title = "No telemetry nodes") => {
                if (detail.status) {
                    detail.status.textContent = "No data";
                    detail.status.classList.remove("is-issue");
                }
                if (detail.time) detail.time.textContent = "Backend empty";
                if (detail.title) detail.title.textContent = title;
                if (detail.subtitle) detail.subtitle.textContent = "Add telemetry nodes in Django admin to show live network data.";
                if (detail.pressure) detail.pressure.textContent = "—";
                if (detail.flow) detail.flow.textContent = "—";
                if (detail.latency) detail.latency.textContent = "—";
                if (detail.uptime) detail.uptime.textContent = "—";
                if (detail.uptimeMeter) {
                    detail.uptimeMeter.dataset.value = "0%";
                    detail.uptimeMeter.style.setProperty("--progress", "0%");
                }
                if (detail.action) {
                    detail.action.disabled = true;
                    detail.action.textContent = "No node selected";
                }
            };
            const selectNetworkNode = (node) => {
                const nodes = Array.from(networkLayer.querySelectorAll(".network-node"));
                const pipes = Array.from(networkLayer.querySelectorAll(".network-pipe"));
                nodes.forEach((item) => item.classList.toggle("is-selected", item === node));
                const routes = (node.dataset.route || "").split(/\s+/).filter(Boolean);
                pipes.forEach((pipe) => {
                    const active = routes.includes(pipe.dataset.route);
                    pipe.classList.toggle("is-highlighted", active);
                    pipe.classList.toggle("is-dimmed", !active);
                });
                const isIssue = node.dataset.status === "issue";
                if (detail.status) {
                    detail.status.textContent = isIssue ? "Issue" : "Online";
                    detail.status.classList.toggle("is-issue", isIssue);
                }
                if (detail.time) detail.time.textContent = "Updated from backend";
                if (detail.title) detail.title.textContent = node.dataset.title || "";
                if (detail.subtitle) detail.subtitle.textContent = node.dataset.subtitle || "";
                if (detail.pressure) detail.pressure.textContent = node.dataset.pressure || "";
                if (detail.flow) detail.flow.textContent = node.dataset.flow || "";
                if (detail.latency) detail.latency.textContent = node.dataset.latency || "";
                if (detail.uptime) detail.uptime.textContent = node.dataset.uptime || "";
                if (detail.uptimeMeter) {
                    detail.uptimeMeter.dataset.value = node.dataset.uptime || "0%";
                    detail.uptimeMeter.style.setProperty("--progress", node.dataset.uptime || "0%");
                }
                if (detail.action) {
                    detail.action.disabled = false;
                    detail.action.textContent = "Open node details";
                }
            };
            networkLayer.querySelectorAll(".network-node").forEach((node) => {
                node.addEventListener("click", () => selectNetworkNode(node));
            });
            const firstVisibleNode = Array.from(networkLayer.querySelectorAll(".network-node")).find((node) => !node.classList.contains("is-hidden"));
            if (firstVisibleNode) selectNetworkNode(firstVisibleNode);
            else clearNetworkDetail();
            networkMap.querySelectorAll("[data-network-filter]").forEach((button) => {
                if (button.dataset.dynamicNetworkFilterReady === "true") return;
                button.dataset.dynamicNetworkFilterReady = "true";
                button.addEventListener("click", () => {
                    networkMap.querySelectorAll("[data-network-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
                    const filter = button.dataset.networkFilter || "all";
                    networkLayer.querySelectorAll(".network-node").forEach((node) => {
                        const hidden = filter === "issue" ? node.dataset.status !== "issue" : filter === "online" ? node.dataset.status === "issue" : false;
                        node.classList.toggle("is-hidden", hidden);
                    });
                    const nextNode = Array.from(networkLayer.querySelectorAll(".network-node")).find((node) => !node.classList.contains("is-hidden"));
                    if (nextNode) selectNetworkNode(nextNode);
                    else clearNetworkDetail("No matching telemetry nodes");
                });
            });
        }

        const pressureBars = document.querySelector(".pressure-bars");
        if (pressureBars) {
            const backendPressure = Array.isArray(billingData.pressureSeries)
                ? billingData.pressureSeries.map((sample) => Number(sample.pressurePsi)).filter((value) => Number.isFinite(value) && value > 0)
                : [];
            const source = backendPressure.length ? backendPressure.slice(-20) : stats.complexes.flatMap((complex) => [
                complex.pressurePsi,
                Math.max(35, complex.pressurePsi + (complex.risk === "Critical" ? -8 : 1)),
                Math.min(62, complex.pressurePsi + (complex.risk === "Low Risk" ? 2 : -1)),
                complex.pressurePsi,
            ]).slice(0, 20);
            const maxPressure = Math.max(...source, 60);
            pressureBars.querySelectorAll(".flex-1").forEach((bar, index) => {
                const value = source[index] || stats.avgPressure;
                const ratio = Math.max(28, Math.round((value / maxPressure) * 100));
                bar.style.height = `${ratio}%`;
                bar.className = `flex-1 ${value < 48 ? "bg-error/30" : value >= stats.avgPressure ? "bg-secondary/30" : "bg-tertiary/20"} rounded-t-sm hover:bg-tertiary/40 transition-colors cursor-pointer group relative`;
                bar.innerHTML = `<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">${moneyFormatter.format(value)} PSI</div>`;
            });
        }

        const readiness = exactText("Total Transaction Volume")?.closest(".bg-surface-container-low");
        const readinessValue = readiness?.querySelector(".text-xl.font-black");
        if (readinessValue) readinessValue.textContent = formatBillingUzs(stats.transactionVolume);

        const paymentSystems = Array.from(document.querySelectorAll("h3"))
            .find((heading) => heading.textContent.trim().toLowerCase().includes("payment systems"))
            ?.closest(".bg-surface-container-low");
        paymentSystems?.querySelectorAll(".bg-surface-container-lowest").forEach((row) => {
            const name = row.querySelector("p.text-xs")?.textContent.trim();
            const amount = row.querySelector("p.text-lg");
            if (amount && name) amount.innerHTML = `${formatBillingUzs(stats.methodTotals[name] || 0).replace(" UZS", "")} <span class="text-xs font-medium">UZS</span>`;
        });

        document.querySelectorAll(".payment-channel").forEach((channel) => {
            const name = channel.querySelector("p.font-black")?.textContent.trim();
            if (!name) return;
            const amount = stats.methodTotals[name] || 0;
            const transactions = billingData.transactions.filter((transaction) => transaction.method === name);
            const success = transactions.filter((transaction) => transaction.status === "Success").length;
            const rate = transactions.length ? (success / transactions.length) * 100 : 0;
            const amountNode = Array.from(channel.querySelectorAll("p")).find((node) => node.textContent.includes("UZS") && node.className.includes("font-black"));
            if (amountNode) amountNode.textContent = formatCompactUzs(amount);
            const metricValues = channel.querySelectorAll(".text-lg.font-black, .text-xl.font-black");
            if (metricValues[0]) metricValues[0].textContent = moneyFormatter.format(transactions.length);
            if (metricValues[1]) metricValues[1].textContent = percentValue(rate);
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

        const trendBars = document.querySelectorAll(".debtor-trend-chart .debtor-trend-bar");
        if (trendBars.length) {
            const pendingDebt = billingData.transactions
                .filter((transaction) => transaction.status !== "Success")
                .reduce((total, transaction) => total + transaction.amount, 0);
            const factors = [0.78, 0.82, 0.86, 0.91, 0.96, 1];
            const values = factors.map((factor, index) => Math.max(0, (stats.totalDebt * factor) + (pendingDebt * (index / Math.max(factors.length - 1, 1)) * 0.08)));
            const maxValue = Math.max(...values, 1);
            trendBars.forEach((bar, index) => {
                const value = values[index] || stats.totalDebt;
                const height = Math.max(24, Math.round((value / maxValue) * 100));
                bar.style.height = `${height}%`;
                bar.dataset.value = formatCompactUzs(value);
                const tooltip = bar.querySelector(".debtor-trend-tooltip");
                if (tooltip) tooltip.textContent = formatBillingUzs(value);
                bar.classList.toggle("debtor-trend-bar-risk", index === trendBars.length - 1 && (stats.criticalAlerts > 0 || stats.criticalDebtUnits > 0));
            });
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

        const districtInsights = document.querySelector("[data-liquid-panel='district-insights']");
        if (districtInsights) {
            const insightRows = districtInsights.querySelector(".space-y-6");
            if (insightRows) {
                const demandLiters = stats.totalWaterM3 * 1000;
                const heatingLoad = stats.totalHeatingM3;
                const pressureState = stats.avgPressure < 50 ? "Needs review" : "Within target range";
                const pressureClass = stats.avgPressure < 50 ? "text-error" : "text-secondary";
                const maintenanceZones = stats.warningComplexes.length;
                insightRows.innerHTML = `
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-lg bg-primary-container/40 flex items-center justify-center text-primary shadow-sm border border-outline-variant/10">
                            <span class="material-symbols-outlined">water_drop</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-bold text-on-surface-variant uppercase tracking-tight mb-1">Water Demand</p>
                            <p class="text-lg font-black text-on-surface leading-tight">${compactNumber(demandLiters)} <span class="text-xs font-medium">Ltrs/day</span></p>
                            <div class="mt-2 flex items-center gap-1 text-[10px] ${pressureClass} font-bold">
                                <span class="material-symbols-outlined text-[12px]">${stats.avgPressure < 50 ? "warning" : "check_circle"}</span>
                                <span>${moneyFormatter.format(stats.avgPressure)} PSI avg · ${pressureState}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-lg bg-tertiary-container/35 flex items-center justify-center text-tertiary shadow-sm border border-outline-variant/10">
                            <span class="material-symbols-outlined">device_thermostat</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-bold text-on-surface-variant uppercase tracking-tight mb-1">Heating Load</p>
                            <p class="text-lg font-black text-on-surface leading-tight">${compactNumber(heatingLoad)} <span class="text-xs font-medium">m³/day</span></p>
                            <div class="mt-2 flex items-center gap-1 text-[10px] ${maintenanceZones ? "text-tertiary" : "text-secondary"} font-bold">
                                <span class="material-symbols-outlined text-[12px]">${maintenanceZones ? "build" : "check_circle"}</span>
                                <span>${maintenanceZones ? `${maintenanceZones} zones need maintenance` : "All heating zones stable"}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        const recentAlertsPanel = document.querySelector("[data-liquid-panel='recent-alerts']");
        if (recentAlertsPanel) {
            const backendRecentItems = Array.isArray(billingData.notifications)
                ? billingData.notifications.filter((item) => !item.read)
                : [];
            const alertItems = backendRecentItems.length ? backendRecentItems.map((item) => ({
                severity: item.severity || "info",
                title: item.title,
                message: item.message || item.eventAt || "",
                meta: item.severity === "critical" ? "Priority: High" : item.eventAt || "Backend event",
            })) : stats.complexes.flatMap((complex) => {
                const items = [];
                if (complex.water !== "Optimal") {
                    items.push({
                        severity: "critical",
                        title: "Water issue detected",
                        message: `${complex.name}: ${complex.water}. ${formatBillingUzs(complex.debt)} outstanding.`,
                        meta: "Priority: High",
                    });
                }
                if (complex.heating !== "Optimal") {
                    items.push({
                        severity: complex.heating === "Maintenance" ? "warning" : "critical",
                        title: "Heating maintenance required",
                        message: `${complex.name}: ${complex.heating}. ${complex.debtorResidents} debt units.`,
                        meta: complex.heating === "Maintenance" ? "Maintenance queue" : "Priority: High",
                    });
                }
                return items;
            });
            const countBadge = recentAlertsPanel.querySelector(".flex.items-center.justify-between span");
            if (countBadge) countBadge.textContent = `${alertItems.length} New`;
            const list = recentAlertsPanel.querySelector(".space-y-4");
            if (list) {
                list.innerHTML = alertItems.length
                    ? alertItems.slice(0, 3).map((alert) => {
                        const tone = alert.severity === "critical" ? "error" : "tertiary";
                        return `
                            <div class="p-3 bg-${tone}-container/10 border-l-4 border-${tone} rounded-r-lg" data-liquid-alert-card data-alert-severity="${escapeHtml(alert.severity)}">
                                <p class="text-xs font-bold text-on-surface">${escapeHtml(alert.title)}</p>
                                <p class="text-[11px] text-on-surface-variant mt-1">${escapeHtml(alert.message)}</p>
                                <p class="text-[10px] text-${tone} font-black mt-2 uppercase tracking-tight">${escapeHtml(alert.meta)}</p>
                            </div>
                        `;
                    }).join("")
                    : `
                        <div class="p-4 bg-secondary-container/10 border border-secondary/15 rounded-lg" data-liquid-alert-card>
                            <p class="text-xs font-bold text-on-surface">No active alerts</p>
                            <p class="text-[11px] text-on-surface-variant mt-1">All residential systems are synced with current local data.</p>
                        </div>
                    `;
            }
            const viewActivitiesButton = recentAlertsPanel.querySelector("button");
            if (viewActivitiesButton) {
                viewActivitiesButton.type = "button";
                viewActivitiesButton.dataset.viewActivities = "true";
            }
        }

        document.querySelectorAll("[data-value]").forEach((meter) => {
            const value = meter.dataset.value;
            if (!value || !meter.classList.contains("percent-meter")) return;
            meter.style.setProperty("--progress", value);
        });

        if (window.Chart?.getChart) {
            const monthly = getMonthlyTransactionStats();
            const analyticsChart = window.Chart.getChart(document.getElementById("analytics-balance-chart"));
            if (analyticsChart) {
                analyticsChart.data.labels = monthly.labels;
                analyticsChart.data.datasets[0].data = monthly.values.map((item) => item.pending);
                analyticsChart.data.datasets[1].data = monthly.values.map((item) => item.success);
                analyticsChart.data.datasets[2].data = monthly.values.map((item) => item.total);
                analyticsChart.data.datasets[3].data = monthly.values.map((item) => item.success);
                analyticsChart.update("none");
            }
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
        const telegramUser = formatTelegramHandle(resident.telegramUser);
        const telegramClass = telegramUser ? "is-telegram-connected" : "is-telegram-empty";
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
                            <p>${escapeHtml([resident.complex || "-", resident.building || ""].filter(Boolean).join(" · "))}</p>
                        </div>
                    </div>
                    <div class="resident-list-cell">
                        <span data-i18n-key="TG user">TG user</span>
                        <strong class="resident-list-telegram ${telegramClass}">${escapeHtml(telegramUser || "-")}</strong>
                    </div>
                    <div class="resident-list-cell">
                        <span data-i18n-key="Contract">Contract</span>
                        <strong class="resident-list-pill-wrap"><span class="resident-status-pill ${contractClass}"><span class="resident-status-pill__label" data-i18n-key="${escapeAttr(contractTranslationKey)}">${escapeHtml(contractValue)}</span></span></strong>
                    </div>
                    <div class="resident-list-cell">
                        <span data-i18n-key="Apartment">Apartment</span>
                        <strong>${escapeHtml(resident.apartmentNumber || resident.apartment || "-")}</strong>
                    </div>
                    <div class="resident-list-balance resident-list-balance-panel">
                        <div class="resident-list-balance-main">
                            <span data-i18n-key="Current Balance">Current Balance</span>
                            <strong class="${balanceClass}"><span class="material-symbols-outlined" aria-hidden="true">${balanceIcon}</span>${formatBillingUzs(resident.balance || 0)}</strong>
                        </div>
                        <div class="resident-list-actions">
                            <a class="resident-list-action is-edit" href="${escapeAttr(resident.adminUrl || "#")}">
                                <span class="material-symbols-outlined" aria-hidden="true">edit</span>
                                <span data-i18n-key="Edit">Edit</span>
                            </a>
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
            const current = readListUrlState(config.name, { ordering: config.defaultOrdering }).ordering;
            const next = current === sortKey ? `-${sortKey}` : current === `-${sortKey}` ? sortKey : (config.defaultSortDirection?.[sortKey] === "desc" ? `-${sortKey}` : sortKey);
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
                syncSortIndicators(meta.ordering || config.defaultOrdering);
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
        const groupLabel = (key, label, hidden = false) => `<div class="notification-group-label ${hidden ? "hidden" : ""}" data-notification-group="${key}">${label}</div>`;
        const severityLabel = (severity) => severity === "critical" ? "Critical" : severity === "warning" ? "Warning" : "Info";
        const actionButtons = (item) => {
            const primary = item.actionPrimary || (item.severity === "critical" ? "Assign technician" : "Details");
            const secondary = item.actionSecondary || (item.severity === "critical" ? "Close alert" : "");
            return `
                <div class="mt-3 flex gap-2">
                    <button class="drawer-action ${item.severity === "critical" ? "bg-error" : "bg-primary"} text-white" ${item.severity === "critical" ? `data-assign-technician type="button"` : `data-notification-action="${escapeAttr(item.actionState || `${primary} queued`)}" type="button"`}>${escapeHtml(primary)}</button>
                    ${secondary ? `<button class="drawer-action bg-surface-container text-primary" ${item.severity === "critical" ? 'data-confirm-action="close-critical-alert"' : `data-notification-action="${escapeAttr(`${secondary} queued`)}"`} type="button">${escapeHtml(secondary)}</button>` : ""}
                </div>
            `;
        };
        const renderItem = (item) => {
            const severity = ["critical", "warning", "info"].includes(item.severity) ? item.severity : "info";
            return `
                <div class="notification-item ${severity === "critical" ? "critical-pulse" : ""}"
                    data-notification-id="${escapeAttr(item.id)}"
                    data-notification-backend-id="${escapeAttr(item.backendId || "")}"
                    data-notification-section="${escapeAttr(item.section || "today")}"
                    data-read="${item.read ? "true" : "false"}"
                    data-pinned="${item.pinned ? "true" : "false"}"
                    data-severity="${escapeAttr(severity)}">
                    <div class="notification-card-head">
                        <p class="severity-badge severity-${escapeAttr(severity)}"><span class="status-dot dot-${severity === "critical" ? "critical" : severity === "warning" ? "warning" : "info"}"></span>${severityLabel(severity)}</p>
                        <div class="notification-card-meta">
                            <time class="text-[10px] text-on-surface-variant">${escapeHtml(item.eventAt || "")}</time>
                            <button aria-label="Pin notification" aria-pressed="${item.pinned ? "true" : "false"}" class="notification-pin" data-notification-pin type="button"><span class="material-symbols-outlined">${item.pinned ? "keep_off" : "keep"}</span><span class="notification-pin-label">${item.pinned ? "Pinned" : "Pin"}</span></button>
                        </div>
                    </div>
                    <p class="text-sm font-bold text-on-surface mt-2">${escapeHtml(item.title)}</p>
                    <p class="text-xs text-on-surface-variant mt-1">${escapeHtml(item.message || "")}</p>
                    <p class="notification-action-state ${item.actionState ? "" : "hidden"}" data-notification-state>${escapeHtml(item.actionState || "")}</p>
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
            `<div class="empty-state ${items.length ? "hidden" : ""}" data-notification-empty><span class="material-symbols-outlined">notifications_off</span><div><p>No hidden alerts</p><span>Resolved notifications are moved to the activity log.</span></div></div>`,
        ].join("");
    };
    const renderAuditMarkup = (items = []) => {
        const iconForType = (type) => ({
            export: "ios_share",
            reminder: "notifications_active",
            alert: "warning",
            balance: "account_balance_wallet",
            note: "edit_note",
            status: "sell",
            system: "settings_suggest",
        }[type] || "history");
        return items.map((event) => `
            <div class="audit-event" data-audit-event data-type="${escapeAttr(event.type || "system")}" data-audit-backend-id="${escapeAttr(event.backendId || "")}">
                <span class="audit-event-icon material-symbols-outlined">${escapeHtml(iconForType(event.type))}</span>
                <div>
                    <time>${escapeHtml(event.time || "")}</time>
                    <p>${escapeHtml(event.message || event.title || "")}</p>
                    <span>${escapeHtml(event.label || event.type || "System")}</span>
                </div>
            </div>
        `).join("");
    };
    const markServerDrivenHosts = () => {
        document.querySelector("[data-resident-grid]")?.setAttribute("data-server-list", "residents");
        findSectionHeading("Recent Transaction Log")?.closest(".bg-surface-container-lowest")?.querySelector("table")?.setAttribute("data-server-list", "transactions");
        document.querySelector("[data-maintenance-body]")?.closest("table")?.setAttribute("data-server-list", "maintenance");
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
        const residentPageSize = Number(residentsGrid?.dataset.residentPageSize || residentsGrid?.dataset.residentLimit || 8) || 8;
        const residentCollapsedSize = Number(residentsGrid?.dataset.residentCollapsedSize || 10) || 10;
        let residentExpanded = false;
        let residentFilterSortState = { filter: "all", direction: "" };
        const residentFilterDefaults = {
            page: "1",
            status: "all",
            ordering: "name",
        };
        const residentLegacyFilterKeys = ["telegram", "contract", "owner_id", "name", "phone", "telegram_user", "building", "apartment"];
        const residentSortDirections = {
            id: "desc",
            name: "asc",
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
            const normalized = String(ordering || "name");
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
            const normalized = String(current || "name");
            const currentKey = normalized.startsWith("-") ? normalized.slice(1) : normalized;
            const currentDesc = normalized.startsWith("-");
            const defaultDesc = residentSortDirections[sortKey] === "desc";
            let next = defaultDesc ? `-${sortKey}` : sortKey;
            if (currentKey === sortKey) {
                next = currentDesc ? sortKey : `-${sortKey}`;
            }
            writeListUrlState("residents", { ordering: next, page: 1 });
            loadResidents();
        };
        const updateResidentExpandButton = (total, shown) => {
            if (!residentExpandButton) return;
            const canExpand = !residentExpanded && Number(total || 0) > Number(shown || 0);
            residentExpandButton.classList.toggle("hidden", !canExpand);
            residentExpandButton.setAttribute("aria-hidden", canExpand ? "false" : "true");
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
            const payload = await fetchServerList("/api/lists/residents/", {
                ...params,
                page: state.page,
                page_size: effectivePageSize,
                status: scopedStatus,
                ordering: state.ordering,
            });
            residentsGrid.innerHTML = payload.results.map((resident) => renderResidentCardMarkup(resident, residentLayout)).join("");
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
                playSound("soft-click");
                openResidentProfileByOwner({ ownerBackendId, fallback, closePalette: false });
            });
            document.addEventListener("hydroflow:language-changed", () => {
                window.requestAnimationFrame(() => syncResidentMetaLabels(residentCount?.dataset.total || 0));
            });
            serverListControllers.residents = { name: "residents", load: loadResidents, refresh: () => loadResidents() };
        }

        const transactionTable = findSectionHeading("Recent Transaction Log")?.closest(".bg-surface-container-lowest")?.querySelector("table");
        if (transactionTable) {
            const transactionChrome = prepareServerTableChrome(transactionTable, {
                name: "transactions",
                sortMap: ["id", "resident", "type", "amount", "status", "created_at"],
                defaultOrdering: "-created_at",
                defaultSortDirection: { id: "desc", resident: "asc", type: "asc", created_at: "desc", amount: "desc", status: "desc" },
                load: () => loadTransactions(),
            });
            const renderTransactions = (items = []) => {
                const colspan = transactionTable.querySelector("thead tr")?.cells.length || 6;
                if (!items.length) {
                    return `<tr data-smart-empty="true"><td class="px-6 py-8 text-sm text-on-surface-variant" colspan="${colspan}">No transactions found.</td></tr>`;
                }
                return items.map((item) => {
                    const pending = Number(item.signedAmount || 0) <= 0 || String(item.status || "").toLowerCase() === "pending";
                    return `
                        <tr class="hover:bg-surface-container-low transition-colors"
                            data-transaction-id="${escapeAttr(item.id)}"
                            data-resident-id="${escapeAttr(item.residentId)}"
                            data-complex-id="${escapeAttr(item.complexId)}"
                            data-backend-id="${escapeAttr(item.backendId || "")}"
                            data-backend-type="transaction"
                            data-owner-backend-id="${escapeAttr(item.ownerBackendId || "")}"
                            data-apartment-backend-id="${escapeAttr(item.apartmentBackendId || "")}"
                            data-building-backend-id="${escapeAttr(item.buildingBackendId || "")}"
                            data-complex-backend-id="${escapeAttr(item.complexBackendId || "")}">
                            <td class="px-4 py-4"><input aria-label="Select row" data-row-select type="checkbox"></td>
                            <td class="px-6 py-4">
                                <p class="font-bold text-primary text-sm">${escapeHtml(String(item.id || "").toUpperCase())}</p>
                                <p class="text-[10px] text-on-surface-variant">${escapeHtml(item.externalId || "Backend transaction")}</p>
                            </td>
                            <td class="px-6 py-4">
                                <p class="font-bold text-primary text-sm">${escapeHtml(item.residentName || "Resident")}</p>
                                <p class="text-[10px] text-on-surface-variant">${escapeHtml(item.apartment ? `Apartment ${item.apartment}` : item.residentId || "")}</p>
                            </td>
                            <td class="px-6 py-4 text-xs font-medium text-on-surface-variant">${escapeHtml(item.method || item.type || "Payment")}</td>
                            <td class="px-6 py-4 text-sm font-bold ${pending ? "text-error" : "text-on-surface"}">${formatBillingUzs(item.amount || 0)}</td>
                            <td class="px-6 py-4">${renderTableStatus(item.status)}</td>
                            <td class="px-6 py-4 text-xs text-on-surface-variant">${escapeHtml(item.date)}</td>
                        </tr>
                    `;
                }).join("");
            };
            const loadTransactions = async () => {
                const state = readListUrlState("transactions", { page: "1", search: "", ordering: "-created_at" });
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

        const maintenanceTable = document.querySelector("[data-maintenance-body]")?.closest("table");
        if (maintenanceTable) {
            const maintenanceChrome = prepareServerTableChrome(maintenanceTable, {
                name: "maintenance",
                sortMap: ["title", "location", "priority", "scheduled_at", "status", null],
                defaultOrdering: "-priority,-scheduled_at",
                defaultSortDirection: { title: "asc", location: "asc", priority: "desc", scheduled_at: "desc", status: "desc" },
                load: () => loadMaintenance(),
            });
            const renderMaintenance = (items = []) => {
                const colspan = maintenanceTable.querySelector("thead tr")?.cells.length || 7;
                if (!items.length) {
                    return `<tr data-smart-empty="true"><td class="px-6 py-8 text-sm text-on-surface-variant" colspan="${colspan}">No maintenance tasks found.</td></tr>`;
                }
                return items.map((task) => `
                    <tr class="maintenance-log-row hover:bg-surface-container-low transition-colors group"
                        data-maintenance-row
                        data-maintenance-id="${escapeAttr(task.backendId || task.id || "")}"
                        data-backend-id="${escapeAttr(task.backendId || task.id || "")}"
                        data-backend-type="maintenance"
                        data-complex-id="${escapeAttr(task.complexId || "")}"
                        data-building-id="${escapeAttr(task.buildingId || "")}"
                        data-priority="${escapeAttr(String(task.priorityKey || "").toLowerCase())}"
                        data-status-key="${escapeAttr(String(task.statusKey || "").toLowerCase())}"
                        data-admin-url="${escapeAttr(task.adminUrl || "")}"
                        data-date="${escapeAttr(task.date || "")}">
                        <td class="px-4 py-4"><input aria-label="Select row" data-row-select type="checkbox"></td>
                        <td class="px-5 py-4">
                            <div class="flex items-center gap-3">
                                <div class="maintenance-task-icon">
                                    <span class="material-symbols-outlined">${escapeHtml(task.icon || "fact_check")}</span>
                                </div>
                                <span class="maintenance-task-title">${escapeHtml(task.task || task.title)}</span>
                            </div>
                        </td>
                        <td class="px-5 py-4 text-sm text-on-surface-variant">${escapeHtml(task.location || "")}</td>
                        <td class="px-5 py-4 whitespace-nowrap">${renderTableStatus(task.priority)}</td>
                        <td class="px-5 py-4 text-sm text-on-surface whitespace-nowrap">${escapeHtml(task.date || "")}</td>
                        <td class="px-5 py-4 whitespace-nowrap">${renderTableStatus(task.status)}</td>
                        <td class="px-5 py-4 text-right whitespace-nowrap"><button class="maintenance-action-button" data-maintenance-action type="button">${escapeHtml(task.action || "Open checklist")}</button></td>
                    </tr>
                `).join("");
            };
            const loadMaintenance = async () => {
                const state = readListUrlState("maintenance", { page: "1", search: "", ordering: "-priority,-scheduled_at" });
                const { params } = currentGlobalListFilters();
                const payload = await fetchServerList("/api/lists/maintenance/", {
                    ...params,
                    page: state.page,
                    page_size: 6,
                    search: state.search,
                    ordering: state.ordering,
                });
                maintenanceChrome.body.innerHTML = renderMaintenance(payload.results || []);
                maintenanceChrome.syncMeta(payload);
            };
            serverListControllers.maintenance = { name: "maintenance", load: loadMaintenance, refresh: () => loadMaintenance() };
        }

        const notificationList = document.querySelector("[data-notification-list]");
        if (notificationList) {
            const drawer = notificationList.closest("#notifications-drawer");
            const pager = ensureDrawerPagination(notificationList.parentElement || drawer, "alerts");
            const filterButtons = Array.from(document.querySelectorAll("[data-notification-filter]"));
            const loadAlerts = async () => {
                const activeFilter = filterButtons.find((button) => button.classList.contains("is-active"))?.dataset.notificationFilter || "all";
                const state = readListUrlState("alerts", { page: "1", ordering: "-pinned,-event_at" });
                const { params } = currentGlobalListFilters();
                const payload = await fetchServerList("/api/lists/alerts/", {
                    ...params,
                    page: state.page,
                    page_size: 12,
                    ordering: state.ordering,
                    severity: activeFilter === "all" ? "" : activeFilter,
                });
                notificationList.innerHTML = renderNotificationMarkup(payload.results || []);
                if (pager) {
                    pager.dataset.totalPages = String(payload.pages || 1);
                    pager.querySelector("[data-page-label]").textContent = `Page ${payload.page} of ${payload.pages}`;
                    pager.querySelector("[data-prev-page]").disabled = Number(payload.page || 1) <= 1;
                    pager.querySelector("[data-next-page]").disabled = Number(payload.page || 1) >= Number(payload.pages || 1);
                }
                updateNotifications();
                window.HydroFlowSyncLocale?.();
            };
            filterButtons.forEach((button) => button.addEventListener("click", () => {
                filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
                writeListUrlState("alerts", { page: 1 });
                loadAlerts();
            }));
            pager?.querySelector("[data-prev-page]")?.addEventListener("click", () => {
                const state = readListUrlState("alerts", { page: "1" });
                writeListUrlState("alerts", { page: Math.max(1, Number(state.page || 1) - 1) });
                loadAlerts();
            });
            pager?.querySelector("[data-next-page]")?.addEventListener("click", () => {
                const state = readListUrlState("alerts", { page: "1" });
                writeListUrlState("alerts", { page: Math.min(Number(pager?.dataset.totalPages || 1), Number(state.page || 1) + 1) });
                loadAlerts();
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
            table.dataset.billingControlsReady = "true";
            let page = 1;
            const pageSize = 6;
            let filteredRows = [];
            const currentRows = () => Array.from(body.querySelectorAll("tr")).filter((row) => !row.dataset.smartEmpty);
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
                    if (labelKey.includes("complex") || labelKey.includes("комплекс") || labelKey.includes("kompleks")) {
                        const value = datasetText("sortName");
                        if (value) return value;
                    }
                    if (labelKey.includes("infra") || labelKey.includes("инфра")) {
                        const value = datasetNumber("sortUnits") || datasetNumber("sortBuildings");
                        if (value) return value;
                    }
                    if (labelKey.includes("system") || labelKey.includes("систем") || labelKey.includes("tizim")) {
                        const value = datasetNumber("sortSystemRank") || datasetNumber("sortHealth");
                        if (value) return value;
                    }
                    if (labelKey.includes("finance") || labelKey.includes("фина") || labelKey.includes("moliya")) {
                        const value = datasetNumber("sortHealth") || datasetNumber("sortFinance");
                        if (value) return value;
                    }
                    if (labelKey.includes("debt") || labelKey.includes("долг") || labelKey.includes("qarz")) {
                        const value = datasetNumber("sortDebt");
                        if (value) return value;
                    }
                    if (labelKey.includes("action") || labelKey.includes("действ") || labelKey.includes("amal")) {
                        const value = datasetNumber("sortDebtors") || datasetNumber("sortPaid");
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
                    const label = header.querySelector(".table-filter-heading-text")?.textContent.trim() || header.textContent.trim();
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
                        body.querySelectorAll(".residential-drill-row:not([data-drill-row='district'])").forEach((row) => row.remove());
                        body.querySelectorAll("[data-drill-row='district']").forEach((row) => {
                            row.classList.remove("is-expanded");
                            row.setAttribute("aria-expanded", "false");
                        });
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
        const recentTable = recentHeading?.closest(".bg-surface-container-lowest")?.querySelector("table");
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
            const debtSplitTone = (debtors, paid) => {
                const ratio = paid ? debtors / paid : Infinity;
                if (ratio > 1) return "is-danger";
                if (ratio >= 0.75) return "is-caution";
                return "is-healthy";
            };
            const singleSector = getSingleSectorStats();
            performanceBody.innerHTML = [singleSector].map((complex) => {
                const waterIssue = complex.water !== "Optimal";
                const heatingIssue = complex.heating !== "Optimal";
                const riskTextClass = complex.risk === "Critical" ? "text-error" : "text-on-surface";
                const splitTone = debtSplitTone(complex.debtorResidents, complex.paidResidents);
                return `
                    <tr aria-expanded="false" class="hidden hover:bg-surface-container-low/30 transition-colors residential-district-row residential-sector-root-row"
                        data-district-id="${escapeHtml(complex.id)}"
                        data-backend-id="${escapeHtml(complex.backendId || "")}"
                        data-backend-type="sector"
                        data-drill-row="district"
                        data-sort-name="${escapeHtml(complex.name)}"
                        data-sort-buildings="${Number(complex.buildings) || 0}"
                        data-sort-units="${Number(complex.units) || 0}"
                        data-sort-health="${Number(complex.health) || 0}"
                        data-sort-system-rank="${complex.risk === "Critical" ? 3 : complex.risk === "Medium Risk" ? 2 : 1}"
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
                            <div class="space-y-1">
                                <p class="text-sm font-bold text-on-surface">${complex.buildings} <span class="text-xs font-normal text-on-surface-variant" data-i18n-key="Buildings">Buildings</span></p>
                                <p class="text-sm font-bold text-on-surface">${complex.units} <span class="text-xs font-normal text-on-surface-variant" data-i18n-key="Units">Units</span></p>
                            </div>
                        </td>
                        <td class="px-6 py-5">
                            <div class="flex flex-col gap-2">
                                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full ${waterIssue ? "bg-error" : "bg-secondary"}"></span><span class="text-[10px] font-bold ${waterIssue ? "text-error" : "text-secondary"} uppercase tracking-tight"><span data-i18n-key="Water">Water</span>: <span data-i18n-key="${escapeHtml(complex.water)}">${escapeHtml(complex.water)}</span></span></div>
                                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full ${heatingIssue ? "bg-[#EAB308]" : "bg-secondary"}"></span><span class="text-[10px] font-bold ${heatingIssue ? "text-[#854D0E]" : "text-secondary"} uppercase tracking-tight"><span data-i18n-key="Heating">Heating</span>: <span data-i18n-key="${escapeHtml(complex.heating)}">${escapeHtml(complex.heating)}</span></span></div>
                            </div>
                        </td>
                        <td class="px-6 py-5">
                            <div class="w-24">
                                <div class="percent-meter percent-meter-${escapeHtml(complex.tone)} percent-meter-compact" style="--progress: ${complex.health}%;" data-value="${complex.health}%">
                                    <span class="percent-meter-track"><span class="percent-meter-fill"></span></span>
                                </div>
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
                                <button class="px-4 py-2 text-xs font-bold bg-primary text-white rounded-lg hover:brightness-110 active:scale-95 transition-all" data-detail-open type="button" data-i18n-key="Details">Details</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
            const footerText = performanceTable.closest(".bg-surface-container-lowest")?.querySelector(".border-t span.text-xs");
            if (footerText) footerText.textContent = `Showing 1 sector with ${singleSector.buildings} homes`;
            repairEnhancedTableControls(performanceTable);
            setupResidentialHierarchy();
        }

        safeSyncSiteStatistics();
        const maintenanceTable = document.querySelector("[data-maintenance-body]")?.closest("table");
        repairEnhancedTableControls(maintenanceTable);
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

    document.querySelector("[data-mark-read]")?.addEventListener("click", () => {
        document.querySelectorAll("[data-notification-list] .notification-item").forEach((item) => {
            item.dataset.read = "true";
            item.classList.remove("critical-pulse");
        });
        updateNotifications();
    });

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
            window.HydroFlowApplyLanguage?.(storage.getItem("hydroflow-lang") || "en");
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
        const transactionMetaText = (payment) => [payment.method, payment.description]
            .filter(Boolean)
            .map((item) => historyText(item))
            .join(" · ");

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
        const openResidentHistory = (resident) => {
            if (!historyModal || !resident) return;
            activeHistoryResident = resident;
            const residentTransactions = getResidentTransactions(resident.id)
                .slice()
                .sort((a, b) => transactionDateValue(b.createdAt || b.date) - transactionDateValue(a.createdAt || a.date));
            if (historyTitle) historyTitle.textContent = resident.name || "Resident transactions";
            if (historySubtitle) {
                historySubtitle.textContent = [resident.building, resident.apartment].filter(Boolean).join(" · ") || "Live transaction history from database.";
            }
            if (historyList) {
                historyList.innerHTML = residentTransactions.map((payment) => {
                    const signedAmount = Number(payment.signedAmount ?? payment.amount ?? 0);
                    const amountTone = signedAmount >= 0 ? "is-positive" : "is-negative";
                    const amountPrefix = signedAmount >= 0 ? "+" : "";
                    const transactionId = payment.backendId || payment.id || "--";
                    const paymentTime = payment.createdAt || payment.date || "--";
                    const balanceBefore = Number(payment.balanceBefore || 0);
                    const balanceAfter = Number(payment.balanceAfter || 0);
                    const realMeta = transactionMetaText(payment);
                    return `
                        <div class="resident-transaction-item">
                            <div class="resident-transaction-cell resident-transaction-cell-id">
                                <strong>#${escapeHtml(transactionId)}</strong>
                                <small>${escapeHtml(historyText(payment.type || payment.method || "Transaction"))}</small>
                            </div>
                            <div class="resident-transaction-cell resident-transaction-cell-datetime">
                                <strong>${escapeHtml(paymentTime)}</strong>
                                <small>${escapeHtml(realMeta || payment.externalId || "")}</small>
                            </div>
                            <div class="resident-transaction-cell resident-transaction-cell-amount">
                                <strong class="resident-transaction-amount ${amountTone}">${amountPrefix}${formatBillingUzs(Math.abs(signedAmount))}</strong>
                            </div>
                            <div class="resident-transaction-cell resident-transaction-cell-balance">
                                <strong class="${balanceBefore < 0 ? "is-negative" : "is-positive"}">${formatBillingUzs(balanceBefore)}</strong>
                            </div>
                            <div class="resident-transaction-cell resident-transaction-cell-balance">
                                <strong class="${balanceAfter < 0 ? "is-negative" : "is-positive"}">${formatBillingUzs(balanceAfter)}</strong>
                            </div>
                        </div>
                    `;
                }).join("");
            }
            historyEmpty?.classList.toggle("hidden", residentTransactions.length > 0);
            openOverlayById("resident-transactions-modal");
        };
        document.addEventListener("hydroflow:language-changed", () => {
            if (historyModal?.classList.contains("is-open") && activeHistoryResident) {
                openResidentHistory(activeHistoryResident);
            }
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

    const setupResidentialHierarchy = () => {
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

        const ownerPool = billingData.residents.map((resident) => ({
            name: resident.name,
            phone: resident.phone,
            email: `${resident.name.toLowerCase().replace(/\s+/g, ".")}@hydroflow.local`,
            photo: resident.photo || "",
        }));

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
        const unitsForBuilding = (district, index) => {
            const realBuilding = district.buildingItems?.[index - 1];
            if (realBuilding) return realBuilding.apartments?.length || realBuilding.units || 0;
            const base = Math.floor(district.units / district.count);
            const remainder = district.units % district.count;
            return base + (index <= remainder ? 1 : 0);
        };
        const buildingName = (district, index) => {
            const realBuilding = district.buildingItems?.[index - 1];
            if (realBuilding) return realBuilding.name || `House ${realBuilding.number || index}`;
            const suffix = String.fromCharCode(64 + index);
            return `${district.prefix} ${suffix}`;
        };
        const ownerFor = (buildingIndex, unitIndex) => ownerPool.length
            ? ownerPool[(buildingIndex + unitIndex) % ownerPool.length]
            : { name: "Unassigned owner", phone: "", email: "", photo: "" };
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
                    },
                    ownerBackendId: realApartment.ownerBackendId || "",
                    apartmentBackendId: realApartment.apartmentBackendId || realApartment.backendId || "",
                    buildingBackendId: realApartment.buildingBackendId || "",
                    complexBackendId: realApartment.complexBackendId || "",
                    balance: Number(realApartment.balance || 0),
                    status: realApartment.status || "Paid",
                    rooms: realApartment.rooms || "Apartment",
                    area: realApartment.area || "",
                    charge: realApartment.charge ? String(realApartment.charge) : "",
                    meter: realApartment.meter || "",
                    contract: realApartment.contract || "",
                    visit: realApartment.visit || "",
                    lastPayment: realApartment.lastPayment || "",
                    occupancy: realApartment.occupancy || "Resident",
                };
            }
            const owner = ownerFor(buildingIndex, unitIndex);
            const floor = Math.floor((unitIndex - 1) / 4) + 2;
            const door = ((unitIndex - 1) % 4) + 1;
            const unit = `${floor}0${door}-${String.fromCharCode(64 + buildingIndex)}`;
            const isDebtor = districtId === "harbor" ? unitIndex % 4 === 0 : unitIndex % 7 === 0;
            const balance = isDebtor ? -(680000 + (unitIndex * 123000)) : (unitIndex % 5 === 0 ? 0 : 1240000 + (unitIndex * 35000));
            return {
                unit,
                owner,
                ownerBackendId: "",
                apartmentBackendId: "",
                buildingBackendId: district?.buildingItems?.[buildingIndex - 1]?.backendId || "",
                complexBackendId: "",
                balance,
                status: isDebtor ? "Overdue" : "Paid",
                rooms: `${2 + (unitIndex % 3)} rooms`,
                area: `${58 + (unitIndex % 8) * 6} m²`,
                charge: formatUzs(980000 + (unitIndex % 6) * 110000),
                meter: `HF-${districtId.slice(0, 3).toUpperCase()}-${buildingIndex}${String(unitIndex).padStart(2, "0")}`,
                contract: `HF-${9000 + buildingIndex * 100 + unitIndex}`,
                visit: `${String(8 + (unitIndex % 6)).padStart(2, "0")}.04.2026`,
                lastPayment: `${String(1 + (unitIndex % 13)).padStart(2, "0")}.04.2026`,
                occupancy: unitIndex % 9 === 0 ? "Owner away" : "Resident",
            };
        };

        const makeSelectCell = (label) => table.querySelector("[data-select-all]")
            ? `<td class="px-4 py-4"><input aria-label="${attr(label)}" type="checkbox"></td>`
            : "";
        const debtSplitMarkup = (debtorCount, paidCount, tone) => `
            <div class="resident-debt-split ${tone}" aria-label="${debtorCount} debtors and ${paidCount} paid residents">
                <span><b>${debtorCount}</b><small data-i18n-key="Debt">Debt</small></span>
                <span><b>${paidCount}</b><small data-i18n-key="Paid">Paid</small></span>
            </div>
        `;

        const renderOwner = (owner, unit) => {
            const avatar = owner.photo
                ? `<img class="residential-owner-photo" src="${attr(owner.photo)}" alt="">`
                : `<span class="residential-owner-initials">${escapeHtml(initialFor(owner.name))}</span>`;
            return `
                <div class="residential-owner-cell">
                    ${avatar}
                    <div>
                        <strong>${escapeHtml(owner.name)}</strong>
                        <span>${escapeHtml(unit)}</span>
                        <span class="resident-phone-line">
                            <span class="material-symbols-outlined" aria-hidden="true">call</span>
                            <b>${escapeHtml(owner.phone)}</b>
                            <button aria-label="Copy ${attr(owner.name)} phone number" class="resident-copy-phone" data-copy-phone="${attr(owner.phone)}" type="button">
                                <span class="material-symbols-outlined" aria-hidden="true">content_copy</span>
                            </button>
                        </span>
                    </div>
                </div>
            `;
        };

        const renderBuildingRow = (districtId, index) => {
            const district = districts[districtId];
            const realBuilding = district.buildingItems?.[index - 1];
            const unitCount = unitsForBuilding(district, index);
            const healthIssue = realBuilding ? realBuilding.risk === "Critical" : district.issueEvery && index % district.issueEvery === 0;
            const completion = realBuilding ? realBuilding.health : Math.max(78, Math.min(99, 93 + (index % 6) - (healthIssue ? 9 : 0)));
            const debt = realBuilding ? realBuilding.debt : Math.round(district.debt / district.count) + (healthIssue ? 4200000 : index * 175000);
            const debtorCount = realBuilding ? realBuilding.debtorResidents : Math.max(1, Math.round(unitCount * (healthIssue ? 0.24 : districtId === "harbor" ? 0.17 : 0.07)));
            const paidCount = realBuilding ? realBuilding.paidResidents : Math.max(0, unitCount - debtorCount);
            const splitRatio = paidCount === 0 ? Infinity : debtorCount / paidCount;
            const splitTone = splitRatio > 1 ? "is-danger" : splitRatio >= 0.75 ? "is-caution" : "is-healthy";
            const buildingRisk = realBuilding?.risk || (healthIssue ? "Review" : district.risk);
            const buildingRiskClass = buildingRisk === "Critical" ? "is-critical" : buildingRisk === "Medium Risk" ? "is-medium" : "";
            const row = document.createElement("tr");
            row.className = "residential-drill-row residential-building-row";
            row.dataset.drillChild = "true";
            row.dataset.drillRow = "building";
            row.dataset.parentDistrict = districtId;
            row.dataset.buildingId = `${districtId}-${index}`;
            row.dataset.buildingIndex = String(index);
            row.dataset.backendId = String(realBuilding?.backendId || "");
            row.dataset.backendType = "building";
            row.dataset.sortName = buildingName(district, index);
            row.dataset.sortBuildings = "1";
            row.dataset.sortUnits = String(unitCount);
            row.dataset.sortHealth = String(completion);
            row.dataset.sortSystemRank = buildingRisk === "Critical" ? "3" : buildingRisk === "Medium Risk" || buildingRisk === "Review" ? "2" : "1";
            row.dataset.sortFinance = String(debt);
            row.dataset.sortDebt = String(debt);
            row.dataset.sortDebtors = String(debtorCount);
            row.dataset.sortPaid = String(paidCount);
            row.setAttribute("aria-expanded", "false");
            row.tabIndex = 0;
            row.innerHTML = `
                ${makeSelectCell(`Select ${buildingName(district, index)}`)}
                <td class="px-6 py-4">
                    <div class="residential-nested-name">
                        <span class="material-symbols-outlined residential-drill-chevron" aria-hidden="true">expand_more</span>
                        <span class="residential-level-chip" data-i18n-key="House">House</span>
                        <div>
                            <p>${escapeHtml(buildingName(district, index))}</p>
                            <small>${escapeHtml(realBuilding?.parentComplexName || district.complex)}</small>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="space-y-1">
                        <p class="text-sm font-bold text-on-surface">${unitCount} <span class="text-xs font-normal text-on-surface-variant" data-i18n-key="Apartments">Apartments</span></p>
                        <p class="text-xs text-on-surface-variant">${realBuilding?.address ? escapeHtml(realBuilding.address) : `${8 + (index % 5)} <span data-i18n-key="floors">floors</span> · ${index % 2 ? "A" : "B"} <span data-i18n-key="entrance">entrance</span>`}</p>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full ${healthIssue ? "bg-error" : "bg-secondary"}"></span><span class="text-[10px] font-bold ${healthIssue ? "text-error" : "text-secondary"} uppercase tracking-tight"><span data-i18n-key="Water">Water</span>: <span data-i18n-key="${healthIssue ? "Review" : "Optimal"}">${healthIssue ? "Review" : "Optimal"}</span></span></div>
                        <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-secondary"></span><span class="text-[10px] font-bold text-secondary uppercase tracking-tight"><span data-i18n-key="Heating">Heating</span>: <span data-i18n-key="Optimal">Optimal</span></span></div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="percent-meter percent-meter-${healthIssue ? "red" : district.tone} percent-meter-compact" style="--progress: ${completion}%;" data-value="${completion}%"><span class="percent-meter-track"><span class="percent-meter-fill"></span></span></div>
                </td>
                <td class="px-6 py-4">
                    <p class="text-sm font-bold ${healthIssue ? "text-error" : "text-on-surface"}">${formatUzs(debt)}</p>
                    <span class="residential-risk-pill ${buildingRiskClass}" data-i18n-key="${buildingRisk}">${buildingRisk}</span>
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
                <td class="px-6 py-4">${renderOwner(apartment.owner, `Apartment ${apartment.unit}`)}</td>
                <td class="px-6 py-4"><p class="text-sm font-bold text-on-surface" data-i18n-key="${attr(apartment.rooms)}">${escapeHtml(apartment.rooms)}</p><p class="text-xs text-on-surface-variant">${escapeHtml(apartment.area)} · ${escapeHtml(apartment.meter)}</p></td>
                <td class="px-6 py-4"><span class="residential-status-dot ${apartment.status === "Overdue" ? "is-danger" : ""}"></span><span class="text-xs font-bold text-on-surface" data-i18n-key="${attr(apartment.occupancy)}">${escapeHtml(apartment.occupancy)}</span></td>
                <td class="px-6 py-4"><p class="text-sm font-bold text-on-surface">${escapeHtml(apartment.charge)}</p><p class="text-xs text-on-surface-variant" data-i18n-key="Monthly charge">Monthly charge</p></td>
                <td class="px-6 py-4"><p class="text-sm font-bold ${apartment.balance < 0 ? "text-error" : "text-on-surface"}">${formatUzs(apartment.balance)}</p><span class="residential-risk-pill ${apartment.status === "Overdue" ? "is-critical" : "is-paid"}" data-i18n-key="${attr(apartment.status)}">${escapeHtml(apartment.status)}</span></td>
                <td class="px-6 py-4 text-right">
                    <button class="residential-detail-button" data-apartment-details
                        data-title="Apartment ${attr(apartment.unit)}"
                        data-subtitle="${attr(building)} · ${attr(district.complex)}"
                        data-owner="${attr(apartment.owner.name)}"
                        data-photo="${attr(apartment.owner.photo)}"
                        data-phone="${attr(apartment.owner.phone)}"
                        data-email="${attr(apartment.owner.email)}"
                        data-balance="${attr(formatUzs(apartment.balance))}"
                        data-status="${attr(apartment.status)}"
                        data-unit="${attr(apartment.unit)}"
                        data-rooms="${attr(apartment.rooms)}"
                        data-area="${attr(apartment.area)}"
                        data-meter="${attr(apartment.meter)}"
                        data-charge="${attr(apartment.charge)}"
                        data-occupancy="${attr(apartment.occupancy)}"
                        data-contract="${attr(apartment.contract)}"
                        data-visit="${attr(apartment.visit)}"
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
        const collapseBuilding = (row) => {
            row?.classList.remove("is-expanded");
            row?.setAttribute("aria-expanded", "false");
            if (row?.dataset.buildingId) removeRows(`[data-parent-building="${row.dataset.buildingId}"]`);
        };
        const collapseDistrict = (row) => {
            row?.classList.remove("is-expanded");
            row?.setAttribute("aria-expanded", "false");
            if (row?.dataset.districtId) removeRows(`[data-parent-district="${row.dataset.districtId}"]`);
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
                en: ["House", "Infra", "Systems", "Finance", "Debt", "Actions"],
                ru: ["Дом", "Инфра", "Системы", "Финансы", "Долг", "Действия"],
                uz: ["Uy", "Infra", "Tizim", "Moliya", "Qarz", "Amal"],
            };
            const fullLabels = ["House Name", "Infrastructure", "System Health", "Finances", "Debt Status", "Actions"];
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
                row.classList.toggle("hidden", isRootSectorRow(row) || row.dataset.globalFilterHidden === "true");
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
            window.HydroFlowSyncLocale?.();
        };

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
            set("[data-apartment-title]", data.title);
            set("[data-apartment-subtitle]", data.subtitle);
            set("[data-apartment-owner]", data.owner);
            set("[data-apartment-owner-meta]", `${data.contract} · last visit ${data.visit}`);
            set("[data-apartment-balance]", data.balance);
            set("[data-apartment-payment]", `Last payment ${data.payment}`);
            set("[data-apartment-status]", data.status);
            set("[data-apartment-unit]", data.unit);
            set("[data-apartment-rooms]", data.rooms);
            set("[data-apartment-area]", data.area);
            set("[data-apartment-meter]", data.meter);
            set("[data-apartment-charge]", data.charge);
            set("[data-apartment-occupancy]", data.occupancy);
            set("[data-apartment-phone]", data.phone);
            set("[data-apartment-email]", data.email);
            set("[data-apartment-contract]", data.contract);
            set("[data-apartment-visit]", data.visit);
            set("[data-apartment-activity-1]", `${data.payment}: payment state is ${data.status.toLowerCase()}.`);
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
    };
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
    const liveStatsEnabledPages = new Set(["dashboard", "system_health"]);
    const liveStatsEnabledForCurrentPage = () => liveStatsEnabledPages.has(String(document.body.dataset.activePage || "").trim());
    const refreshBackendData = async () => {
        if (document.body.dataset.backendRefreshRunning === "true") return;
        document.body.dataset.backendRefreshRunning = "true";
        try {
            const response = await fetch("/api/portal-data/", {
                cache: "no-store",
                credentials: "same-origin",
                headers: { Accept: "application/json" },
            });
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
            safeSyncSiteStatistics();
            window.HydroFlowApplyFilters?.(readFilterState(), { resetPage: false });
            document.dispatchEvent(new CustomEvent("hydroflow:backend-refreshed"));
        } catch {
            // The UI keeps the last successful payload when the local backend is temporarily unavailable.
        } finally {
            document.body.dataset.backendRefreshRunning = "false";
        }
    };
    const refreshBackendDataIfActive = () => {
        if (!liveStatsEnabledForCurrentPage()) return;
        if (document.hidden) return;
        if (typeof document.hasFocus === "function" && !document.hasFocus()) return;
        if (!claimLiveStatsLock()) return;
        refreshBackendData();
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

    const openOverlayById = (id) => {
        const overlay = document.getElementById(id);
        const backdrop = document.querySelector("[data-overlay-backdrop]");
        if (!overlay) return;
        playSound("modal-open");
        document.querySelectorAll(".app-drawer.is-open").forEach((drawer) => {
            drawer.classList.remove("is-open");
            drawer.classList.add("translate-x-full");
            drawer.style.transform = "";
            drawer.style.display = "";
            drawer.style.visibility = "";
            drawer.style.pointerEvents = "";
            drawer.setAttribute("aria-hidden", "true");
        });
        document.querySelectorAll(".app-modal.is-open").forEach((modal) => {
            modal.classList.add("hidden");
            modal.classList.remove("is-open", "flex");
            modal.setAttribute("aria-hidden", "true");
        });
        backdrop?.classList.remove("hidden");
        window.requestAnimationFrame(() => backdrop?.classList.add("is-visible"));
        overlay.classList.remove("hidden");
        overlay.classList.add("is-open");
        if (overlay.classList.contains("app-drawer")) {
            overlay.classList.remove("translate-x-full");
            overlay.style.display = "block";
            overlay.style.visibility = "visible";
            overlay.style.pointerEvents = "auto";
            overlay.style.transform = "translateX(0)";
        } else {
            overlay.classList.add("flex");
        }
        overlay.setAttribute("aria-hidden", "false");
        loadOverlayServerList(id);
    };

    const closeOverlayById = (id) => {
        const overlay = document.getElementById(id);
        const backdrop = document.querySelector("[data-overlay-backdrop]");
        if (!overlay) return;
        overlay.classList.add("hidden");
        overlay.classList.remove("is-open", "flex");
        if (overlay.classList.contains("app-drawer")) {
            overlay.classList.add("translate-x-full");
            overlay.style.transform = "";
            overlay.style.display = "";
            overlay.style.visibility = "";
            overlay.style.pointerEvents = "";
        }
        overlay.setAttribute("aria-hidden", "true");
        if (!document.querySelector(".app-drawer.is-open, .app-modal.is-open")) {
            backdrop?.classList.remove("is-visible");
            window.setTimeout(() => backdrop?.classList.add("hidden"), 140);
        }
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
        const sectionSelect = form.querySelector("[data-resident-create-section]");
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
                        section: apartment.meter || "No section",
                        apartmentBackendId: apartment.apartmentBackendId,
                        unit: apartment.unit,
                        label: `${complex.name} / ${building.name} / ${apartment.meter || "No section"} / Apt. ${apartment.unit}`,
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
            const selectedSection = sectionSelect?.value || "";

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
                sectionSelect,
                uniqueBy(buildingRows, "section"),
                (row) => row.section,
                (row) => row.section,
                "No sections",
            );
            if (selectedSection && Array.from(sectionSelect.options).some((option) => option.value === selectedSection)) {
                sectionSelect.value = selectedSection;
            }

            const apartmentRows = buildingRows.filter((row) => String(row.section) === String(sectionSelect?.value || ""));
            fillSelect(
                apartmentSelect,
                apartmentRows,
                (row) => row.apartmentBackendId,
                (row) => row.label,
                "No free apartments",
            );
        };

        [complexSelect, buildingSelect, sectionSelect].forEach((select) => {
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
                    balance: formData.get("balance"),
                    has_contract: formData.get("has_contract"),
                    telegram_id: formData.get("telegram_id"),
                    telegram_user: formData.get("telegram_user"),
                    telegram_status: formData.get("telegram_status"),
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
                    section_name: formData.get("section_name"),
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

    const setupMaintenanceDeploy = () => {
        const form = document.querySelector("[data-deploy-maintenance-form]");
        if (!form || form.dataset.deployReady === "true") return;
        form.dataset.deployReady = "true";
        const complexSelect = form.querySelector("[data-maintenance-complex]");
        const buildingSelect = form.querySelector("[data-maintenance-building]");
        const scheduledInput = form.querySelector("[data-maintenance-scheduled]");
        const submit = form.querySelector("[data-deploy-maintenance-submit]");
        const status = form.querySelector("[data-deploy-maintenance-status]");
        const prioritySelect = form.querySelector("select[name='priority']");
        const titleInput = form.querySelector("input[name='title']");

        const setStatus = (message, type = "info") => {
            if (!status) return;
            status.classList.remove("hidden", "is-error", "is-success");
            status.classList.toggle("is-error", type === "error");
            status.classList.toggle("is-success", type === "success");
            const text = status.querySelector("p");
            if (text) text.textContent = message;
        };
        const dateTimeLocalValue = (date) => {
            const offsetMs = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
        };
        const allBuildings = () => billingData.complexes.flatMap((complex) => (
            Array.isArray(complex.buildingItems) ? complex.buildingItems.map((building) => ({ ...building, parentComplex: complex })) : []
        ));
        const syncBuildingOptions = () => {
            if (!buildingSelect) return;
            const selectedComplexId = complexSelect?.value || "";
            const buildings = allBuildings().filter((building) => String(building.parentComplex?.backendId || "") === selectedComplexId);
            buildingSelect.innerHTML = [
                '<option value="">Whole complex</option>',
                ...buildings.map((building) => `<option value="${escapeHtml(building.backendId || "")}">${escapeHtml(building.name || building.number || "Building")}</option>`),
            ].join("");
        };
        const syncComplexOptions = () => {
            if (!complexSelect) return;
            const previous = complexSelect.value;
            const complexes = billingData.complexes.filter((complex) => complex.backendId);
            complexSelect.innerHTML = complexes.map((complex) => (
                `<option value="${escapeHtml(complex.backendId)}">${escapeHtml(complex.name)}</option>`
            )).join("");
            const target = complexes.slice().sort((a, b) => (b.extraDebt || 0) - (a.extraDebt || 0))[0];
            const nextValue = previous && complexes.some((complex) => String(complex.backendId) === String(previous))
                ? previous
                : String(target?.backendId || complexes[0]?.backendId || "");
            complexSelect.value = nextValue;
            if (prioritySelect && target && !prioritySelect.dataset.touched) {
                prioritySelect.value = target.risk === "Critical" ? "high" : target.risk === "Medium Risk" ? "medium" : "low";
            }
            syncBuildingOptions();
        };
        const prepareForm = () => {
            syncComplexOptions();
            if (scheduledInput && !scheduledInput.value) {
                scheduledInput.value = dateTimeLocalValue(new Date(Date.now() + 2 * 60 * 60 * 1000));
            }
            if (titleInput && !titleInput.value.trim()) {
                titleInput.value = "Preventive maintenance deployment";
            }
            setStatus("This task will be saved to Django admin, database and the live maintenance table.");
        };

        complexSelect?.addEventListener("change", syncBuildingOptions);
        prioritySelect?.addEventListener("change", () => {
            prioritySelect.dataset.touched = "true";
        });
        document.querySelectorAll("[data-deploy-maintenance-open]").forEach((button) => {
            button.addEventListener("click", prepareForm);
        });
        document.addEventListener("hydroflow:backend-refreshed", syncComplexOptions);
        prepareForm();

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            submit.disabled = true;
            setStatus("Creating maintenance task in Django admin and database...");
            try {
                const payload = await postPortalJson("/api/maintenance/deploy/", {
                    complex_id: formData.get("complex_id"),
                    building_id: formData.get("building_id"),
                    title: formData.get("title"),
                    priority: formData.get("priority"),
                    scheduled_at: formData.get("scheduled_at"),
                    assigned_to: formData.get("assigned_to"),
                    action_label: formData.get("action_label"),
                    notes: formData.get("notes"),
                });
                rehydrateFromPortalData(payload.portalData);
                setStatus("Maintenance task created and synced.", "success");
                toast("Maintenance deployed", "Task was created in Django admin and the system table was refreshed.", "success");
                window.setTimeout(() => closeOverlayById("deploy-maintenance-modal"), 550);
            } catch (error) {
                setStatus(error.message || "Could not deploy maintenance.", "error");
                toast("Maintenance not deployed", error.message || "Check backend data.", "warning");
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
        const complexSelect = form.querySelector("[data-system-alert-complex]");
        const buildingSelect = form.querySelector("[data-system-alert-building]");
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
            const selectedComplexId = complexSelect?.value || "";
            const buildings = allBuildings().filter((building) => String(building.parentComplex?.backendId || "") === selectedComplexId);
            buildingSelect.innerHTML = [
                `<option value="">${escapeHtml(t("Whole complex"))}</option>`,
                ...buildings.map((building) => `<option value="${escapeHtml(building.backendId || "")}">${escapeHtml(building.name || building.number || "Building")}</option>`),
            ].join("");
        };
        const syncComplexOptions = () => {
            if (!complexSelect) return;
            const previous = complexSelect.value;
            const complexes = billingData.complexes.filter((complex) => complex.backendId);
            complexSelect.innerHTML = complexes.map((complex) => (
                `<option value="${escapeHtml(complex.backendId)}">${escapeHtml(complex.name)}</option>`
            )).join("");
            complexSelect.value = previous && complexes.some((complex) => String(complex.backendId) === String(previous))
                ? previous
                : String(complexes[0]?.backendId || "");
            syncBuildingOptions();
        };
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
                        <button data-system-alert-action="acknowledge" data-system-alert-id="${escapeHtml(alert.backendId || "")}" type="button">${escapeHtml(t("Acknowledge"))}</button>
                        <button data-system-alert-action="resolve" data-system-alert-id="${escapeHtml(alert.backendId || "")}" type="button">${escapeHtml(t("Resolve"))}</button>
                        <a href="${escapeHtml(alert.adminUrl || `/admin/portal/systemalert/${alert.backendId}/change/`)}">${escapeHtml(t("Admin"))}</a>
                    </div>
                </article>
            `).join("") : `<div class="system-alert-empty">${escapeHtml(t("No live alerts in backend. Create one from this panel."))}</div>`;
            syncModalStaticText();
        };
        const prepare = () => {
            syncComplexOptions();
            renderAlerts();
            setStatus("Create a live alert and it will immediately sync across dashboard, notifications and system health.");
        };

        complexSelect?.addEventListener("change", syncBuildingOptions);
        document.querySelectorAll("[data-modal-open='system-alerts-config-modal']").forEach((button) => {
            button.addEventListener("click", prepare);
        });
        document.addEventListener("hydroflow:backend-refreshed", () => {
            syncComplexOptions();
            renderAlerts();
        });
        document.addEventListener("hydroflow:language-changed", () => {
            syncComplexOptions();
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
                category: formData.get("category"),
                complex_id: formData.get("complex_id"),
                building_id: formData.get("building_id"),
                assigned_to: formData.get("assigned_to"),
                action_label: formData.get("action_label"),
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
                syncComplexOptions();
                form.querySelector("input[name='assigned_to']").value = t("Operations Team");
                form.querySelector("input[name='action_label']").value = t("Review alert");
                toast("System alert created", "The alert is now stored in Django admin and visible in the portal.", "success");
            } catch (error) {
                const recovered = await refreshPortalDataSnapshot().then(() => findRecoveredSystemAlert(requestPayload, previousAlertIds)).catch(() => null);
                if (recovered) {
                    renderAlerts();
                    setStatus("System alert created and synced.", "success");
                    form.reset();
                    syncComplexOptions();
                    form.querySelector("input[name='assigned_to']").value = t("Operations Team");
                    form.querySelector("input[name='action_label']").value = t("Review alert");
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

    const setupBillingNoticeQuickAction = () => {
        const modal = document.getElementById("billing-notice-modal");
        if (!modal || modal.dataset.ready === "true") return;
        modal.dataset.ready = "true";
        const ensureBillingNoticeLayout = () => {
            const body = modal.querySelector(".px-8.py-6");
            if (body && !modal.querySelector("[data-billing-notice-search]")) {
                const toolbar = document.createElement("div");
                toolbar.dataset.billingNoticeToolbar = "true";
                toolbar.className = "flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-4";
                toolbar.innerHTML = `
                    <div class="flex-1 max-w-xl">
                        <label class="relative block">
                            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                            <input class="w-full h-12 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest pl-12 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30" data-billing-notice-search placeholder="Search debtors..." type="search"/>
                            <button aria-label="Clear debtor search" class="absolute right-3 top-1/2 -translate-y-1/2 hidden h-8 w-8 rounded-full bg-surface-container text-on-surface-variant transition-colors hover:text-on-surface" data-billing-notice-search-clear type="button">
                                <span class="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </label>
                    </div>
                    <div class="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-3 py-2" data-billing-notice-filter-group>
                        <span class="text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant" data-i18n-key="Debt order">Debt order</span>
                        <button class="px-4 py-2 rounded-xl text-xs font-black tracking-[0.12em] uppercase bg-primary/10 text-primary inline-flex items-center gap-2" data-billing-notice-sort type="button">
                            <span class="material-symbols-outlined text-[16px]">swap_vert</span>
                            <span data-billing-notice-sort-label>Largest first</span>
                        </button>
                        <span class="ml-1 rounded-full border border-outline-variant/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant" data-billing-notice-count>0 shown</span>
                    </div>
                `;
                const grid = body.querySelector(".grid");
                if (grid) {
                    body.insertBefore(toolbar, grid);
                } else {
                    body.prepend(toolbar);
                }
            }

            if (!modal.querySelector("[data-billing-notice-copy]") || !modal.querySelector("[data-billing-notice-telegram]")) {
                const panel = modal.querySelector(".modal-panel");
                if (panel) {
                    const footer = document.createElement("div");
                    footer.dataset.billingNoticeFooter = "true";
                    footer.className = "px-8 py-5 border-t border-surface-container flex justify-end gap-3 bg-surface-container-lowest";
                    footer.innerHTML = `
                        <button class="px-5 py-3 rounded-xl bg-surface-container text-sm font-bold text-on-surface" data-close-overlay type="button" data-i18n-key="Close">Close</button>
                        <button class="px-5 py-3 rounded-xl bg-surface-container text-sm font-bold text-on-surface" data-billing-notice-copy type="button" data-i18n-key="Copy notice">Copy notice</button>
                        <button class="px-5 py-3 rounded-xl bg-primary text-sm font-bold text-white" data-billing-notice-telegram type="button" data-i18n-key="Notify in Telegram">Notify in Telegram</button>
                    `;
                    panel.appendChild(footer);
                }
            }
        };

        ensureBillingNoticeLayout();
        const langButtons = Array.from(modal.querySelectorAll("[data-billing-notice-lang]"));
        const searchInput = modal.querySelector("[data-billing-notice-search]");
        const searchClear = modal.querySelector("[data-billing-notice-search-clear]");
        const sortButton = modal.querySelector("[data-billing-notice-sort]");
        const sortLabel = modal.querySelector("[data-billing-notice-sort-label]");
        const countNode = modal.querySelector("[data-billing-notice-count]");
        const listNode = modal.querySelector("[data-billing-notice-list]");
        const emptyNode = modal.querySelector("[data-billing-notice-empty]");
        const copyButton = modal.querySelector("[data-billing-notice-copy]");
        const telegramButton = modal.querySelector("[data-billing-notice-telegram]");
        let activeLang = "uz";
        let activeSort = "desc";
        let activeResidentId = "";
        let noticeResidents = [];

        const noticeCopy = {
            uz: {
                docTitle: "TO'LOV XABARNOMASI",
                company: "MIRABAD AVENUE SERVICE MCHJ",
                heading: "TO'LOV XABARNOMASI",
                subheading: "Majburiy to'lovlardan bo'lgan qarzdorlikni to'lash to'g'risida",
                accountLabel: "Hisob raqami:",
                addressLabel: "Manzili:",
                ownerLabel: "Uy egasi:",
                apartmentLabel: "Kvartira:",
                phoneLabel: "Telefon:",
                balanceLabel: "Qarz miqdori:",
                directorLabel: "Korxona rahbari:",
                managerLabel: "Mas'ul xodim:",
                director: "ERGASHEV DILSHOD TURAVOY O'G'LI",
                manager: "Billing Desk",
                bodyHtml: (resident, amount) => [
                    `Sizga ushbu orqali ma'lum qilamizki, ${resident.lastPayment || "31.03.2026"} holatiga ko'ra majburiy to'lovlar bo'yicha <span class="font-black text-error">${amount}</span> qarzdorlik mavjud.`,
                    "<span class=\"block text-center font-black tracking-tight\">ESLATMA!!!</span>",
                    "Majburiy to'lovlarni belgilangan muddatda to'lamaslik penya va keyingi undirish choralariga olib keladi.",
                    "<span class=\"block text-center font-black tracking-tight\">OGOHLANTIRAMIZ!!!</span>",
                    "Mavjud qarzdorlik sud tartibida undiruv choralariga yuborilishi mumkin. Sud xarajatlari va kechikish jarimalari qarzdor tomon zimmasiga o'tadi.",
                    "Iltimos, qarzdorlikni qisqa muddat ichida to'lang yoki billing bo'limi bilan bog'lanib to'lov grafig'ini aniqlashtiring.",
                ],
                bodyText: (resident, amount) => [
                    `Sizga ushbu orqali ma'lum qilamizki, ${resident.lastPayment || "31.03.2026"} holatiga ko'ra majburiy to'lovlar bo'yicha ${amount} qarzdorlik mavjud.`,
                    "ESLATMA!!!",
                    "Majburiy to'lovlarni belgilangan muddatda to'lamaslik penya va keyingi undirish choralariga olib keladi.",
                    "OGOHLANTIRAMIZ!!!",
                    "Mavjud qarzdorlik sud tartibida undiruv choralariga yuborilishi mumkin. Sud xarajatlari va kechikish jarimalari qarzdor tomon zimmasiga o'tadi.",
                    "Iltimos, qarzdorlikni qisqa muddat ichida to'lang yoki billing bo'limi bilan bog'lanib to'lov grafig'ini aniqlashtiring.",
                ],
            },
            ru: {
                docTitle: "ПЛАТЁЖНОЕ УВЕДОМЛЕНИЕ",
                company: "MIRABAD AVENUE SERVICE MCHJ",
                heading: "ПЛАТЁЖНОЕ УВЕДОМЛЕНИЕ",
                subheading: "О необходимости погашения задолженности по обязательным платежам",
                accountLabel: "Лицевой счёт:",
                addressLabel: "Адрес:",
                ownerLabel: "Собственник:",
                apartmentLabel: "Квартира:",
                phoneLabel: "Телефон:",
                balanceLabel: "Сумма долга:",
                directorLabel: "Руководитель:",
                managerLabel: "Ответственный сотрудник:",
                director: "ЭРГАШЕВ ДИЛШОД ТУРАВОЙ УГЛИ",
                manager: "Billing Desk",
                bodyHtml: (resident, amount) => [
                    `Сообщаем, что по состоянию на ${resident.lastPayment || "31.03.2026"} по обязательным платежам зафиксирована задолженность в размере <span class="font-black text-error">${amount}</span>.`,
                    "<span class=\"block text-center font-black tracking-tight\">ВНИМАНИЕ!!!</span>",
                    "При отсутствии оплаты в установленный срок сумма задолженности может быть передана в дальнейшую работу и сопровождаться начислением пени.",
                    "<span class=\"block text-center font-black tracking-tight\">ПРЕДУПРЕЖДАЕМ!!!</span>",
                    "При дальнейшем отсутствии оплаты материалы могут быть переданы на взыскание. Все сопутствующие расходы и штрафные начисления относятся на должника.",
                    "Просим погасить задолженность в ближайший срок либо связаться с billing-отделом для уточнения графика оплаты.",
                ],
                bodyText: (resident, amount) => [
                    `Сообщаем, что по состоянию на ${resident.lastPayment || "31.03.2026"} по обязательным платежам зафиксирована задолженность в размере ${amount}.`,
                    "ВНИМАНИЕ!!!",
                    "При отсутствии оплаты в установленный срок сумма задолженности может быть передана в дальнейшую работу и сопровождаться начислением пени.",
                    "ПРЕДУПРЕЖДАЕМ!!!",
                    "При дальнейшем отсутствии оплаты материалы могут быть переданы на взыскание. Все сопутствующие расходы и штрафные начисления относятся на должника.",
                    "Просим погасить задолженность в ближайший срок либо связаться с billing-отделом для уточнения графика оплаты.",
                ],
            },
        };

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

        const getDebtors = () => noticeResidents.filter((resident) => debtValue(resident) > 0);

        const renderLoading = () => {
            if (!listNode) return;
            listNode.innerHTML = `
                <div class="px-5 py-8 text-sm font-bold text-on-surface-variant">
                    ${escapeHtml(t("Loading debtors..."))}
                </div>
            `;
            emptyNode?.classList.add("hidden");
            if (countNode) countNode.textContent = `0 ${t("shown")}`;
        };

        const refreshBillingNoticeData = async () => {
            try {
                const response = await fetch("/api/portal-data/", {
                    credentials: "same-origin",
                    headers: { Accept: "application/json" },
                });
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

        const sortDebtors = (rows) => {
            const sorted = rows.slice();
            if (activeSort === "asc") {
                sorted.sort((a, b) => debtValue(a) - debtValue(b));
                return sorted;
            }
            sorted.sort((a, b) => debtValue(b) - debtValue(a));
            return sorted;
        };

        const filteredDebtors = () => {
            const query = searchNoticeText(searchInput?.value || "");
            const rows = getDebtors().filter((resident) => {
                if (!query) return true;
                return searchNoticeText(
                    resident.name,
                    resident.apartment,
                    resident.building,
                    resident.phone,
                    resident.complex,
                    resident.telegramUser,
                    resident.telegramStatus,
                ).includes(query);
            });
            return sortDebtors(rows);
        };

        const buildAccount = (resident) => `ACC-${resident?.ownerBackendId || resident?.backendId || resident?.id || "000"}`;

        const buildNoticeText = (resident) => {
            const copy = noticeCopy[activeLang] || noticeCopy.uz;
            const amount = formatBillingUzs(debtValue(resident));
            const address = [resident?.complexAddress, resident?.building, resident?.apartment].filter(Boolean).join(", ");
            return [
                copy.docTitle,
                copy.company,
                "",
                copy.heading,
                resident?.complex || "Mirabad Avenue",
                copy.subheading,
                "",
                `${copy.accountLabel} ${buildAccount(resident)}`,
                `${copy.addressLabel} ${address || "-"}`,
                `${copy.ownerLabel} ${resident?.name || "-"}`,
                `${copy.apartmentLabel} ${resident?.apartment || "-"}`,
                `${copy.phoneLabel} ${resident?.phone || "-"}`,
                `${copy.balanceLabel} ${amount}`,
                "",
                ...copy.bodyText(resident || {}, amount),
                "",
                `${copy.directorLabel} ${copy.director}`,
                `${copy.managerLabel} ${copy.manager}`,
            ].join("\n");
        };

        const resolveActiveResident = (rows) => {
            if (!rows.length) {
                activeResidentId = "";
                return null;
            }
            const current = rows.find((resident) => String(resident.ownerBackendId || resident.backendId || resident.id) === String(activeResidentId));
            if (current) return current;
            const next = rows[0];
            activeResidentId = String(next.ownerBackendId || next.backendId || next.id);
            return next;
        };

        const renderList = (rows) => {
            if (!listNode || !emptyNode) return;
            if (!rows.length) {
                listNode.innerHTML = "";
                emptyNode.classList.remove("hidden");
                return;
            }
            emptyNode.classList.add("hidden");
            listNode.innerHTML = rows.map((resident) => {
                const residentId = String(resident.ownerBackendId || resident.backendId || resident.id);
                const isActive = residentId === String(activeResidentId);
                return `
                    <button
                        class="w-full text-left px-5 py-4 transition-colors ${isActive ? "bg-primary/5" : "bg-white hover:bg-surface-container-low"}"
                        data-billing-notice-resident="${escapeHtml(residentId)}"
                        type="button"
                    >
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                                <p class="text-sm font-black text-on-surface truncate">${escapeHtml(resident.name || "-")}</p>
                                <p class="text-xs text-on-surface-variant mt-1 truncate">${escapeHtml([resident.building, resident.apartment].filter(Boolean).join(" • ") || resident.apartment || "-")}</p>
                                <p class="text-xs text-on-surface-variant mt-2 truncate">${escapeHtml(resident.phone || "-")}</p>
                            </div>
                            <div class="shrink-0 text-right">
                                <p class="text-sm font-black text-error">${escapeHtml(formatBillingUzs(debtValue(resident)))}</p>
                                <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant mt-1">${escapeHtml(resident.lastPayment || "-")}</p>
                            </div>
                        </div>
                    </button>
                `;
            }).join("");
        };

        const renderPreview = (resident) => {
            const copy = noticeCopy[activeLang] || noticeCopy.uz;
            const generatedAt = new Date().toLocaleString(activeLang === "ru" ? "ru-RU" : "uz-UZ", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
            const amount = resident ? formatBillingUzs(debtValue(resident)) : "";
            const address = [
                resident?.complexAddress,
                resident?.building,
                resident?.apartment,
            ].filter(Boolean).join(", ");
            const account = resident ? buildAccount(resident) : "ACC-000";

            modal.querySelector("[data-billing-notice-doc-title]").textContent = copy.docTitle;
            modal.querySelector("[data-billing-notice-company]").textContent = copy.company;
            modal.querySelector("[data-billing-notice-generated-at]").textContent = generatedAt;
            modal.querySelector("[data-billing-notice-preview-balance]").textContent = resident ? amount : "";
            modal.querySelector("[data-billing-notice-heading]").textContent = copy.heading;
            modal.querySelector("[data-billing-notice-complex]").textContent = resident?.complex || "Mirabad Avenue";
            modal.querySelector("[data-billing-notice-subheading]").textContent = copy.subheading;
            modal.querySelector("[data-billing-notice-account-label]").textContent = copy.accountLabel;
            modal.querySelector("[data-billing-notice-address-label]").textContent = copy.addressLabel;
            modal.querySelector("[data-billing-notice-owner-label]").textContent = copy.ownerLabel;
            modal.querySelector("[data-billing-notice-apartment-label]").textContent = copy.apartmentLabel;
            modal.querySelector("[data-billing-notice-phone-label]").textContent = copy.phoneLabel;
            modal.querySelector("[data-billing-notice-balance-label]").textContent = copy.balanceLabel;
            modal.querySelector("[data-billing-notice-director-label]").textContent = copy.directorLabel;
            modal.querySelector("[data-billing-notice-manager-label]").textContent = copy.managerLabel;
            modal.querySelector("[data-billing-notice-director]").textContent = copy.director;
            modal.querySelector("[data-billing-notice-manager]").textContent = copy.manager;
            modal.querySelector("[data-billing-notice-account]").textContent = resident ? account : "";
            modal.querySelector("[data-billing-notice-address]").textContent = resident ? (address || "-") : "";
            modal.querySelector("[data-billing-notice-owner]").textContent = resident?.name || "";
            modal.querySelector("[data-billing-notice-apartment]").textContent = resident?.apartment || "";
            modal.querySelector("[data-billing-notice-phone]").textContent = resident?.phone || "";
            modal.querySelector("[data-billing-notice-balance]").textContent = resident ? amount : "";
            modal.querySelector("[data-billing-notice-body]").innerHTML = resident ? copy.bodyHtml(resident || {}, amount)
                .map((paragraph) => `<p>${paragraph}</p>`)
                .join("") : "";

            langButtons.forEach((button) => {
                const isActive = button.dataset.billingNoticeLang === activeLang;
                button.classList.toggle("bg-primary", isActive);
                button.classList.toggle("text-white", isActive);
                button.classList.toggle("text-on-surface-variant", !isActive);
            });
        };

        const syncFilters = () => {
            if (!sortButton || !sortLabel) return;
            const descending = activeSort !== "asc";
            sortButton.classList.toggle("bg-primary/10", true);
            sortButton.classList.toggle("text-primary", true);
            sortLabel.textContent = descending ? t("Largest first") : t("Smallest first");
        };

        const render = () => {
            const rows = filteredDebtors();
            const resident = resolveActiveResident(rows);
            renderList(rows);
            renderPreview(resident);
            syncFilters();
            if (countNode) countNode.textContent = `${rows.length} ${t("shown")}`;
            if (searchClear) searchClear.classList.toggle("hidden", !(searchInput?.value || "").trim());
        };

        const openNoticeModal = (preferredResidentId = "") => {
            openOverlayById("billing-notice-modal");
            activeSort = "desc";
            if (searchInput) searchInput.value = "";
            activeResidentId = preferredResidentId ? String(preferredResidentId).replace(/[^\d]/g, "") : "";
            hydrateNoticeResidentsFromState();
            if (noticeResidents.length) {
                render();
            } else {
                renderLoading();
            }
            refreshBillingNoticeData()
                .then(() => {
                    render();
                })
                .catch((error) => {
                    console.error("Billing notice modal render failed", error);
                    toast("Billing notice", "Could not prepare debtor list.", "warning");
                });
        };
        window.HydroFlowOpenBillingNoticeForResident = (ownerBackendId) => {
            const normalized = String(ownerBackendId || "").replace(/[^\d]/g, "");
            openNoticeModal(normalized);
        };
        window.HydroFlowOpenBillingNotice = () => openNoticeModal();

        document.querySelectorAll("[data-billing-notice-open]").forEach((button) => {
            if (button.dataset.billingNoticeReady === "true") return;
            button.dataset.billingNoticeReady = "true";
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                openNoticeModal();
            });
        });

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

        listNode?.addEventListener("click", (event) => {
            const item = event.target.closest("[data-billing-notice-resident]");
            if (!item) return;
            activeResidentId = item.dataset.billingNoticeResident || "";
            render();
        });

        searchInput?.addEventListener("input", () => render());
        searchClear?.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            render();
            searchInput?.focus();
        });

        copyButton?.addEventListener("click", async () => {
            const resident = resolveActiveResident(filteredDebtors());
            if (!resident) return;
            try {
                await navigator.clipboard.writeText(buildNoticeText(resident));
                toast("Billing notice copied", "Notice text was copied to clipboard.", "success");
            } catch {
                toast("Copy failed", "Could not copy notice text.", "warning");
            }
        });

        telegramButton?.addEventListener("click", () => {
            toast("In development", "Telegram notification flow is not connected yet.", "info");
        });

        document.addEventListener("hydroflow:backend-refreshed", () => {
            if (!modal.classList.contains("hidden")) render();
        });
    };

    const setupBillingPeriodQuickAction = () => {};

    setupBuildingCreateForm();
    setupApartmentCreateForm();
    setupResidentCreateForm();
    setupMaintenanceDeploy();
    setupSystemAlertsConfig();

    const assignTechnicianModal = document.getElementById("assign-technician-modal");
    const assignTechnicianSelect = assignTechnicianModal?.querySelector("[data-assign-technician-select]");
    const assignTechnicianNote = assignTechnicianModal?.querySelector("[data-assign-technician-note]");
    const assignTechnicianTarget = assignTechnicianModal?.querySelector("[data-assign-technician-target]");
    const assignTechnicianApply = assignTechnicianModal?.querySelector("[data-assign-technician-apply]");
    let pendingTechnicianAssignment = {};

    const nearestActionPayload = (trigger) => {
        const detailsHost = trigger.closest("#details-drawer");
        if (detailsHost) {
            return {
                owner_id: detailsHost.dataset.ownerBackendId || "",
                apartment_id: detailsHost.dataset.apartmentBackendId || "",
                building_id: detailsHost.dataset.buildingBackendId || "",
                complex_id: detailsHost.dataset.complexBackendId || "",
                alert_id: detailsHost.dataset.alertBackendId || "",
                maintenance_id: detailsHost.dataset.maintenanceBackendId || "",
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
        const maintenanceRow = trigger.closest("[data-maintenance-id]");
        if (maintenanceRow) {
            return {
                maintenance_id: maintenanceRow.dataset.maintenanceId || maintenanceRow.dataset.backendId || "",
                label: maintenanceRow.querySelector("td:nth-child(2)")?.textContent?.trim() || "Maintenance task",
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
            playSound("soft-click");
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

    document.addEventListener("click", (event) => {
        const assignButton = event.target.closest("[data-assign-technician]");
        if (!assignButton) return;
        event.preventDefault();
        pendingTechnicianAssignment = nearestActionPayload(assignButton);
        if (assignTechnicianTarget) assignTechnicianTarget.textContent = pendingTechnicianAssignment.label || "Current item";
        if (assignTechnicianSelect) assignTechnicianSelect.value = "Field Team A";
        if (assignTechnicianNote) assignTechnicianNote.value = "";
        openOverlayById("assign-technician-modal");
    }, true);

    assignTechnicianApply?.addEventListener("click", async () => {
        try {
            const response = await postPortalJson("/api/technicians/assign/", {
                ...pendingTechnicianAssignment,
                technician: assignTechnicianSelect?.value || "Field Team A",
                note: assignTechnicianNote?.value || "",
            });
            rehydrateFromPortalData(response.portalData);
            closeOverlayById("assign-technician-modal");
            toast("Technician assigned", "Assignment saved in backend and synced to portal.", "success");
            pendingTechnicianAssignment = {};
        } catch (error) {
            toast("Assignment failed", error.message || "Backend assignment failed.", "warning");
        }
    });

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

    const openMaintenanceTask = (taskId, explicitUrl = "") => {
        const lang = storage.getItem("hydroflow-lang") || "en";
        const task = (Array.isArray(billingData.maintenanceTasks) ? billingData.maintenanceTasks : [])
            .find((item) => String(item.id || item.backendId) === String(taskId));
        if (!task && explicitUrl) {
            window.location.assign(explicitUrl);
            return;
        }
        if (!task) {
            toast("Maintenance task not found", "The selected task is not available in backend data.", "warning");
            return;
        }
        const action = String(task.action || "").toLowerCase();
        if (action.includes("checklist")) {
            window.HydroFlowOpenChecklist?.(task.title || task.task || translateValue("Open checklist", lang));
            toast(translateValue("Maintenance task opened", lang), translateValue("Open checklist", lang), "info");
            return;
        }
        window.location.assign(explicitUrl || task.adminUrl || `/admin/portal/maintenancetask/${task.backendId}/change/`);
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
            return;
        }
        const maintenanceWidget = event.target.closest("[data-maintenance-widget-item]");
        if (maintenanceWidget) {
            event.preventDefault();
            openMaintenanceTask(maintenanceWidget.dataset.maintenanceId, maintenanceWidget.dataset.adminUrl || "");
            return;
        }
        const maintenanceAction = event.target.closest("[data-maintenance-action]");
        if (maintenanceAction) {
            event.preventDefault();
            const row = maintenanceAction.closest("[data-maintenance-row]");
            openMaintenanceTask(row?.dataset.maintenanceId, row?.dataset.adminUrl || "");
        }
    });

    setupResidentKitTools();

    const checklistStorageKey = "hydroflow-operations-checklist";
    const checklistItems = [
        { id: "filters", title: "Validate active filters", detail: "Confirm district, status and period filters match the current operation scope.", tag: "Data view", icon: "tune" },
        { id: "residents", title: "Review residents and balances", detail: "Check debtor/paid split, resident cards and billing history before handoff.", tag: "Billing", icon: "group" },
        { id: "alerts", title: "Resolve visible critical alerts", detail: "Open notification center and confirm critical items have an owner or technician.", tag: "Safety", icon: "notification_important" },
        { id: "exports", title: "Prepare export package", detail: "Verify CSV/XLSX/PDF preview includes current visible data and backend timestamp.", tag: "Export", icon: "ios_share" },
        { id: "audit", title: "Attach audit note", detail: "Record manual changes or review comments in the backend audit trail.", tag: "Audit", icon: "history" },
    ];
    if (Array.isArray(billingData.checklistItems) && billingData.checklistItems.length) {
        checklistItems.splice(0, checklistItems.length, ...billingData.checklistItems.map((item) => ({
            id: item.id,
            title: item.title,
            detail: item.detail,
            tag: item.tag || "Operations",
            icon: item.icon || "fact_check",
        })));
    }

    const setupChecklist = () => {
        const drawer = document.getElementById("checklist-drawer");
        const list = drawer?.querySelector("[data-checklist-list]");
        if (!drawer || !list || drawer.dataset.checklistReady === "true") return;
        drawer.dataset.checklistReady = "true";
        const notesList = drawer.querySelector("[data-checklist-notes-list]");
        const composer = drawer.querySelector("[data-checklist-note-composer]");
        const noteTemplate = drawer.querySelector("[data-checklist-note-template]");
        const noteInput = drawer.querySelector("[data-checklist-note-input]");
        const readState = () => {
            try {
                return JSON.parse(storage.getItem(checklistStorageKey) || "{}") || {};
            } catch {
                return {};
            }
        };
        const writeState = (state) => storage.setItem(checklistStorageKey, JSON.stringify(state));
        const deletedKey = "__deleted";
        const getDeletedItems = (state = readState()) => Array.isArray(state[deletedKey]) ? state[deletedKey] : [];
        const visibleChecklistItems = (state = readState()) => {
            const deleted = new Set(getDeletedItems(state));
            return checklistItems.filter((item) => !deleted.has(item.id));
        };
        const readNotes = () => Array.isArray(billingData.checklistNotes) ? billingData.checklistNotes.slice(0, 24) : [];
        const allChecklistEntries = (state = readState(), notes = readNotes()) => [
            ...visibleChecklistItems(state).map((item) => ({ ...item, done: Boolean(state[item.id]), custom: false })),
            ...notes.map((note) => ({
                id: note.id,
                title: note.text,
                detail: note.time,
                tag: "Note",
                icon: "edit_note",
                done: Boolean(note.done),
                custom: true,
            })),
        ];
        const updateFab = (state = readState()) => {
            const left = allChecklistEntries(state).filter((item) => !item.done).length;
            const lang = storage.getItem("hydroflow-lang") || "en";
            const suffix = lang === "ru" ? "не выполнено" : lang === "uz" ? "qoldi" : left === 1 ? "task left" : "tasks left";
            document.querySelectorAll("[data-checklist-fab] small").forEach((target) => {
                target.innerHTML = `<b data-checklist-fab-count>${left}</b> ${suffix}`;
            });
            const sidebarSuffix = lang === "ru" ? "ост." : lang === "uz" ? "qoldi" : "left";
            document.querySelectorAll("[data-sidebar-todo-count]").forEach((target) => {
                target.textContent = `${left} ${sidebarSuffix}`;
            });
            document.querySelectorAll("[data-checklist-fab]").forEach((button) => {
                button.classList.toggle("is-complete", left === 0);
                button.setAttribute("aria-label", `Open checklist, ${left} tasks left`);
            });
        };
        const render = () => {
            const state = readState();
            const notes = readNotes();
            const entries = allChecklistEntries(state, notes);
            list.innerHTML = entries.map((item) => {
                const done = Boolean(item.done);
                const isCustom = Boolean(item.custom);
                const id = escapeHtml(item.id);
                const title = escapeHtml(item.title);
                const detail = escapeHtml(item.detail || "");
                const tag = escapeHtml(item.tag || "Note");
                const itemAttr = isCustom ? `data-checklist-note-toggle="${id}"` : `data-checklist-item="${id}"`;
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
                            <button class="checklist-delete-node" ${deleteAttr} type="button" aria-label="${translateValue("Delete", storage.getItem("hydroflow-lang") || "en")}">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </span>
                    </article>
                `;
            }).join("");
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
            updateFab(state);
            window.HydroFlowSyncLocale?.();
        };
        const openChecklist = (scope = "Current workspace") => {
            drawer.querySelector("[data-checklist-scope]").textContent = scope;
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
                    const state = readState();
                    const id = itemDelete.dataset.checklistItemDelete;
                    const deleted = new Set(getDeletedItems(state));
                    deleted.add(id);
                    delete state[id];
                    state[deletedKey] = [...deleted];
                    writeState(state);
                    toast(translateValue("Checklist item removed", storage.getItem("hydroflow-lang") || "en"), translateValue("Removed from current checklist view.", storage.getItem("hydroflow-lang") || "en"), "info");
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
            const state = readState();
            state[item.dataset.checklistItem] = !state[item.dataset.checklistItem];
            writeState(state);
            render();
            playSound("toggle");
        });
        drawer.querySelector("[data-checklist-action='complete-visible']")?.addEventListener("click", () => {
            const state = readState();
            visibleChecklistItems(state).forEach((item) => {
                state[item.id] = true;
            });
            writeState(state);
            render();
            toast("Checklist completed", "All visible checklist items are marked complete.", "success");
        });
        drawer.querySelector("[data-checklist-action='reset']")?.addEventListener("click", () => {
            writeState({});
            render();
            toast("Checklist reset", "Checklist progress was cleared for this workspace.", "warning");
        });
        drawer.querySelector("[data-checklist-action='copy']")?.addEventListener("click", async () => {
            const state = readState();
            const notes = readNotes();
            const noteText = notes.length ? `\n\nNotes\n${notes.map((note) => `${note.done ? "[x]" : "[ ]"} ${note.time}: ${note.text}`).join("\n")}` : "";
            const text = `HydroFlow checklist\n${visibleChecklistItems(state).map((item) => `${state[item.id] ? "[x]" : "[ ]"} ${item.title} - ${item.tag}`).join("\n")}${noteText}`;
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
                scope: drawer.querySelector("[data-checklist-scope]")?.textContent?.trim() || "Operations",
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
            postPortalJson("/api/audit/note/", {
                title: "Checklist reviewed",
                message: "Checklist marked reviewed from operations drawer.",
            }).then((payload) => {
                rehydrateFromPortalData(payload.portalData);
                toast("Review recorded", "A backend audit note was added.", "success");
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
            return JSON.parse(storage.getItem(recentCommandKey) || "[]");
        } catch {
            return [];
        }
    };
    const getRecentSearches = () => {
        try {
            return JSON.parse(storage.getItem(recentSearchKey) || "[]");
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
        storage.setItem(recentSearchKey, JSON.stringify(recent.slice(0, 6)));
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
        storage.setItem(recentCommandKey, JSON.stringify(recent.slice(0, 4)));
        renderRecentCommands();
    };
    const renderRecentCommands = () => {
        const wrap = document.querySelector("[data-command-recent-wrap]");
        const target = document.querySelector("[data-command-recent]");
        if (!wrap || !target) return;
        const recent = getRecentSearches();
        const fallback = recent.length ? [] : [
            billingData.residents[0]?.name,
            billingData.residents[0]?.apartmentNumber ? `Apartment ${billingData.residents[0].apartmentNumber}` : "",
            billingData.complexes[0]?.buildingItems?.[0]?.name,
        ].filter(Boolean);
        const items = recent.length ? recent : fallback;
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
                search: normalizeCommandSearch([
                    unit,
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
                    balance: formatUzs(Number(apartment.balance || 0)),
                    status: apartment.status || "Paid",
                    unit,
                    rooms: apartment.rooms || "Apartment",
                    area: apartment.area || "",
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
            const key = entry.id || `${entry.type}:${entry.title}:${entry.meta}`;
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
        if (!response.ok || requestId !== commandSearchRequestId) return [];
        const payload = await response.json();
        return (payload.results || []).map((resident) => ({
            id: `resident-api-${resident.id || resident.backendId || resident.ownerBackendId}`,
            type: "resident",
            title: resident.name || "Resident",
            meta: [resident.apartment, resident.building || resident.complex, resident.phone].filter(Boolean).join(" · "),
            search: normalizeCommandSearch([
                resident.name,
                resident.phone,
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
        photo: residentProfileModal.querySelector("[data-resident-profile-photo]"),
        fallback: residentProfileModal.querySelector("[data-resident-profile-fallback]"),
        historyButton: residentProfileModal.querySelector("[data-resident-profile-history]"),
        editLink: residentProfileModal.querySelector("[data-resident-profile-edit]"),
        billingButton: residentProfileModal.querySelector("[data-resident-profile-billing-notice]"),
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
    const renderResidentCommandProfile = (resident) => {
        if (!residentProfileNodes || !resident) return;
        residentProfileState.resident = resident;
        const displayId = resident.displayId || extractOwnerBackendId(resident.ownerBackendId, resident.backendId, resident.id) || "--";
        const name = resident.name || "Resident";
        const phone = resident.phone || "--";
        const house = resident.building || "--";
        const apartment = resident.apartmentNumber || resident.apartment || "--";
        const balanceValue = Number(resident.balance || 0);
        const isPositiveBalance = balanceValue >= 0;
        const telegramUser = formatTelegramHandle(resident.telegramUser);
        const telegramStatusRaw = String(resident.telegramStatus || "").toLowerCase();
        const telegramConnected = Boolean(resident.telegramConnected)
            || Boolean(telegramUser)
            || ["connected", "active", "verified", "true", "yes", "1", "linked"].includes(telegramStatusRaw);
        const hasContract = hasResidentContract(resident);
        const ownerBackendId = extractOwnerBackendId(resident.ownerBackendId, resident.backendId, resident.id);

        residentProfileNodes.nameTitle.textContent = name;
        residentProfileNodes.nameCopy.textContent = name;
        residentProfileNodes.subtitle.textContent = [resident.complex, house, apartment].filter(Boolean).join(" · ") || t("Loaded from database");
        residentProfileNodes.id.textContent = String(displayId);
        residentProfileNodes.phone.textContent = phone;
        residentProfileNodes.house.textContent = house;
        residentProfileNodes.apartment.textContent = String(apartment);

        residentProfileNodes.balance.textContent = formatBillingUzs(balanceValue);
        residentProfileNodes.balanceIcon.textContent = isPositiveBalance ? "verified" : "error";
        residentProfileNodes.balanceWrap.classList.toggle("is-positive", isPositiveBalance);
        residentProfileNodes.balanceWrap.classList.toggle("is-negative", !isPositiveBalance);

        residentProfileNodes.tgUser.textContent = telegramUser || t("Not linked");
        residentProfileNodes.tgUser.classList.toggle("is-connected", Boolean(telegramUser));
        residentProfileNodes.tgUser.classList.toggle("is-missing", !telegramUser);

        residentProfileNodes.tgStatus.textContent = telegramConnected ? t("Connected") : t("Not linked");
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
            toast("Resident profile", "Could not load resident data from database.", "warning");
            return;
        }
        renderResidentCommandProfile(resident);
        openOverlayById("resident-command-profile-modal");
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
    const syncAddPaymentSubmitState = () => {
        if (!addPaymentNodes?.submit) return;
        const amountValue = Number(addPaymentNodes.amount?.value || 0);
        const channelReady = addPaymentState.operation === "debit" || ["cash", "terminal"].includes(addPaymentState.channel);
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
                ? t("A real transaction will be written to the database and all balances will refresh from backend data.")
                : t("A real balance subtraction will be written to the database and resident totals will refresh from backend data.");
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

        addPaymentNodes.tgUser.textContent = telegramUser || t("Not linked");
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
            return `
                <button class="add-payment-result ${isSelected ? "is-active" : ""}"
                    data-add-payment-select
                    data-owner-backend-id="${escapeAttr(residentOwnerId)}"
                    type="button">
                    <div class="add-payment-result-top">
                        <strong class="add-payment-result-name">${escapeHtml(resident.name || "Resident")}</strong>
                        <span class="add-payment-result-balance ${isPositiveBalance ? "is-positive" : "is-negative"}">${escapeHtml(formatBillingUzs(resident.balance || 0))}</span>
                    </div>
                    <div class="add-payment-result-meta">${escapeHtml([
                        resident.phone || "--",
                        resident.telegramUser || t("Not linked"),
                        resident.building || resident.complex || "--",
                        resident.apartmentNumber || resident.apartment || "--",
                    ].join(" · "))}</div>
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
        window.setTimeout(() => addPaymentNodes.search?.focus(), 0);
    };
    const submitAddPayment = async () => {
        if (!addPaymentNodes || !addPaymentState.selectedResident || addPaymentState.submitting) return;
        const ownerId = extractOwnerBackendId(
            addPaymentState.selectedResident.ownerBackendId,
            addPaymentState.selectedResident.backendId,
            addPaymentState.selectedResident.id
        );
        const amount = Number(addPaymentNodes.amount?.value || 0);
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
            renderAddPaymentResident(addPaymentResidentByOwnerId(ownerId));
            renderAddPaymentResults();
            if (addPaymentNodes.amount) addPaymentNodes.amount.value = "";
            setAddPaymentStatus(
                addPaymentState.operation === "credit" ? t("Payment saved to database.") : t("Balance subtraction saved to database."),
                "success"
            );
            playSound("payment-success");
            toast(
                addPaymentState.operation === "credit" ? t("Payment saved") : t("Balance updated"),
                addPaymentState.operation === "credit"
                    ? t(addPaymentState.channel === "cash" ? "Cash payment was written to backend database." : "Terminal payment was written to backend database.")
                    : t("Manual subtraction was written to backend database."),
                "success"
            );
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
                const merged = mergeCommandEntries([...matches, ...remoteEntries]).slice(0, 16);
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
    let lastExportSource = document.title;
    let lastExportButton = null;
    let lastExportContext = "default";
    const exportBuildingSelect = exportModal?.querySelector("[data-export-building]");
    const exportApartmentSelect = exportModal?.querySelector("[data-export-apartment]");
    const exportResidentSelect = exportModal?.querySelector("[data-export-resident]");
    const exportDateFromInput = exportModal?.querySelector("[data-export-date-from]");
    const exportDateToInput = exportModal?.querySelector("[data-export-date-to]");
    const getVisibleTableRows = (root = document) => Array.from(root.querySelectorAll("tbody tr")).filter((row) => !row.classList.contains("hidden"));
    const exportText = (key) => translateValue(key, storage.getItem("hydroflow-lang") || "en");
    const exportDateTimeLocalValue = (date) => {
        const offsetMs = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
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
        syncExportFilters();
    };
    const getEffectiveExportContext = (baseContext) => {
        const forcedScopedContext = Boolean(exportResidentSelect?.value || exportApartmentSelect?.value || exportBuildingSelect?.value);
        if (forcedScopedContext) return "transactions";
        if (["usage-report", "billing", "transactions", "debt-letters"].includes(baseContext)) return "transactions";
        if (baseContext === "maintenance") return "maintenance";
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
        if (title.includes("system maintenance log") || title.includes("maintenance log") || title.includes("обслуж") || title.includes("texnik")) return "maintenance";
        if (title.includes("recent transaction log") || title.includes("transaction") || title.includes("транзак") || title.includes("платеж") || title.includes("to'lov")) return "transactions";
        if (title.includes("complex performance") || title.includes("residential") || title.includes("жил") || title.includes("комплекс")) return "residential";
        if (window.location.pathname.toLowerCase().includes("/system-health")) return "maintenance";
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
    const exportLabelMap = {
        "Task": { ru: "Задача", uz: "Vazifa" },
        "Location": { ru: "Локация", uz: "Joylashuv" },
        "Priority": { ru: "Приоритет", uz: "Ustuvorlik" },
        "Date / Time": { ru: "Дата / Время", uz: "Sana / Vaqt" },
        "Status": { ru: "Статус", uz: "Holat" },
        "Assigned to": { ru: "Назначено", uz: "Biriktirilgan" },
        "Action": { ru: "Действие", uz: "Amal" },
        "Usage Report": { ru: "Отчёт потребления", uz: "Iste'mol hisoboti" },
        "Usage rows": { ru: "Строк потребления", uz: "Iste'mol qatorlari" },
        "Water Usage (m³)": { ru: "Вода (м³)", uz: "Suv (m³)" },
        "Heating Usage (m³)": { ru: "Отопление (м³)", uz: "Isitish (m³)" },
        "Total Usage (m³)": { ru: "Общее потребление (м³)", uz: "Jami iste'mol (m³)" },
        "Pressure (PSI)": { ru: "Давление (PSI)", uz: "Bosim (PSI)" },
        "Alert Count": { ru: "Кол-во alerts", uz: "Ogohlantirishlar soni" },
        "Resident": { ru: "Жилец", uz: "Yashovchi" },
        "Invoice": { ru: "Счёт", uz: "Invoys" },
        "Type": { ru: "Тип", uz: "Tur" },
        "Date": { ru: "Дата", uz: "Sana" },
        "Amount": { ru: "Сумма", uz: "Summa" },
        "Amount (UZS)": { ru: "Сумма (UZS)", uz: "Summa (UZS)" },
        "House": { ru: "Дом", uz: "Uy" },
        "Houses": { ru: "Дома", uz: "Uylar" },
        "Apartments": { ru: "Квартиры", uz: "Kvartiralar" },
        "Residents": { ru: "Жильцы", uz: "Yashovchilar" },
        "Report": { ru: "Отчёт", uz: "Hisobot" },
        "REPORT": { ru: "ОТЧЁТ", uz: "HISOBOT" },
        "Transactions": { ru: "Транзакции", uz: "Tranzaksiyalar" },
        "RECENT_TRANSACTION_LOG": { ru: "ЖУРНАЛ ТРАНЗАКЦИЙ", uz: "TRANZAKSIYALAR JURNALI" },
        "Billing": { ru: "Платежи", uz: "To'lovlar" },
        "BILLING": { ru: "ПЛАТЕЖИ", uz: "TO'LOVLAR" },
        "Maintenance": { ru: "Обслуживание", uz: "Texnik xizmat" },
        "SYSTEM_MAINTENANCE_LOG": { ru: "ЖУРНАЛ ОБСЛУЖИВАНИЯ", uz: "TEXNIK XIZMAT JURNALI" },
        "COMPLEXES": { ru: "ДОМА", uz: "UYLAR" },
        "HOUSES": { ru: "ДОМА", uz: "UYLAR" },
        "APARTMENTS": { ru: "КВАРТИРЫ", uz: "KVARTIRALAR" },
        "RESIDENTS": { ru: "ЖИЛЬЦЫ", uz: "YASHOVCHILAR" },
        "DEBT": { ru: "ДОЛГ", uz: "QARZ" },
        "DEBTORS": { ru: "ДОЛЖНИКИ", uz: "QARZDORLAR" },
        "Source": { ru: "Источник", uz: "Manba" },
        "Format": { ru: "Формат", uz: "Format" },
        "Timezone": { ru: "Часовой пояс", uz: "Vaqt zonasi" },
        "Generated local": { ru: "Дата выгрузки", uz: "Yuklab olish vaqti" },
        "Generated ISO": { ru: "Дата выгрузки ISO", uz: "ISO vaqti" },
        "Generated (local)": { ru: "Дата выгрузки", uz: "Yuklab olish vaqti" },
        "Generated (ISO)": { ru: "Дата выгрузки ISO", uz: "ISO vaqti" },
        "HydroFlow export report": { ru: "Экспортный отчёт HydroFlow", uz: "HydroFlow eksport hisoboti" },
        "Дата выгрузки": { en: "Export date", ru: "Дата выгрузки", uz: "Yuklab olish sanasi" },
        "Дата выгрузки (локально)": { en: "Generated local", ru: "Дата выгрузки", uz: "Yuklab olish vaqti" },
        "Дата выгрузки (ISO)": { en: "Generated ISO", ru: "Дата выгрузки ISO", uz: "ISO vaqti" },
        "Rows": { ru: "Строки", uz: "Qatorlar" },
        "Billing rows": { ru: "Строк платежей", uz: "To'lov qatorlari" },
        "Debt rows": { ru: "Строк долга", uz: "Qarz qatorlari" },
        "Total debt": { ru: "Общий долг", uz: "Jami qarz" },
        "Maintenance rows": { ru: "Строк обслуживания", uz: "Texnik qatorlar" },
        "Visible table rows": { ru: "Видимые строки таблицы", uz: "Ko'rinadigan jadval qatorlari" },
        "Complex": { ru: "Дом", uz: "Uy" },
        "Sector": { ru: "Сектор", uz: "Sektor" },
        "Units": { ru: "Квартиры", uz: "Kvartiralar" },
        "Floors": { ru: "Этажи", uz: "Qavatlar" },
        "Health": { ru: "Состояние", uz: "Holat" },
        "Health status": { ru: "Состояние", uz: "Holat" },
        "System Health": { ru: "Состояние систем", uz: "Tizim holati" },
        "Debt": { ru: "Долг", uz: "Qarz" },
        "House debt": { ru: "Долг дома", uz: "Uy qarzi" },
        "Risk": { ru: "Риск", uz: "Xavf" },
        "Object": { ru: "Объект", uz: "Obyekt" },
        "State": { ru: "Состояние", uz: "Holat" },
        "Percent": { ru: "Процент", uz: "Foiz" },
        "Apartment": { ru: "Квартира", uz: "Kvartira" },
        "Balance": { ru: "Баланс", uz: "Balans" },
        "Phone": { ru: "Телефон", uz: "Telefon" },
        "Last payment": { ru: "Последний платеж", uz: "So'nggi to'lov" },
        "Unit": { ru: "Квартира", uz: "Kvartira" },
        "Complex debt": { ru: "Долг дома", uz: "Uy qarzi" },
        "Debtors": { ru: "Должники", uz: "Qarzdorlar" },
        "Low Risk": { ru: "Низкий риск", uz: "Past xavf" },
        "Medium Risk": { ru: "Средний риск", uz: "O'rtacha xavf" },
        "Critical": { ru: "Критично", uz: "Kritik" },
        "Review": { ru: "Проверка", uz: "Tekshiruv" },
        "Optimal": { ru: "Оптимально", uz: "Optimal" },
        "Overdue": { ru: "Просрочено", uz: "Muddati o'tgan" },
        "Paid": { ru: "Оплачено", uz: "To'langan" },
        "Owner away": { ru: "Владелец отсутствует", uz: "Egasi yo'q" },
        "Resident": { ru: "Жилец", uz: "Yashovchi" },
        "North Sector": { ru: "Северный сектор", uz: "Shimoliy sektor" },
        "Harbor District": { ru: "Портовый район", uz: "Port hududi" },
        "West Valley": { ru: "Западная долина", uz: "G'arbiy vodiy" },
        "A entrance": { ru: "подъезд A", uz: "A kirish" },
        "B entrance": { ru: "подъезд B", uz: "B kirish" },
        "Источник": { en: "Source", uz: "Manba" },
        "Формат": { en: "Format", uz: "Format" },
        "Таймзона": { en: "Timezone", uz: "Vaqt zonasi" },
        "ЖК": { en: "House", uz: "Uy" },
        "Домов": { en: "Houses", uz: "Uylar" },
        "Квартир": { en: "Apartments", uz: "Kvartiralar" },
        "Резидентов": { en: "Residents", uz: "Yashovchilar" },
        "Видимых строк в таблице": { en: "Visible table rows", uz: "Ko'rinadigan qatorlar" },
        "Резидент": { en: "Resident", uz: "Yashovchi" },
        "Счет": { en: "Invoice", uz: "Invoys" },
        "Тип": { en: "Type", uz: "Tur" },
        "Дата": { en: "Date", uz: "Sana" },
        "Сумма": { en: "Amount", uz: "Summa" },
        "Статус": { en: "Status", uz: "Holat" },
        "Объект": { en: "Object", uz: "Obyekt" },
        "Состояние": { en: "State", uz: "Holat" },
        "Процент": { en: "Percent", uz: "Foiz" },
        "Квартира": { en: "Apartment", uz: "Kvartira" },
        "Баланс": { en: "Balance", uz: "Balans" },
        "Телефон": { en: "Phone", uz: "Telefon" },
        "Последний платеж": { en: "Last payment", uz: "So'nggi to'lov" },
        "Дом": { en: "House", uz: "Uy" },
        "Сектор": { en: "Sector", uz: "Sektor" },
        "Подъезд": { en: "Entrance", uz: "Kirish" },
        "Системы": { en: "Systems", uz: "Tizimlar" },
        "Проживание": { en: "Occupancy", uz: "Yashash holati" },
        "Площадь": { en: "Area", uz: "Maydon" },
        "Комнат": { en: "Rooms", uz: "Xonalar" },
        "Счетчик": { en: "Meter", uz: "Hisoblagich" },
        "Начисление": { en: "Charge", uz: "Hisoblangan" },
        "Последний визит": { en: "Last visit", uz: "So'nggi tashrif" },
        "Контракт": { en: "Contract", uz: "Shartnoma" },
        "Статус оплаты": { en: "Payment status", uz: "To'lov holati" },
        "Риск": { en: "Risk", uz: "Xavf" },
        "Долг ЖК": { en: "House debt", uz: "Uy qarzi" },
        "Долг дома": { en: "House debt", uz: "Uy qarzi" },
        "Этажей": { en: "Floors", uz: "Qavatlar" },
        "Должников": { en: "Debtors", uz: "Qarzdorlar" },
        "Действие": { en: "Action", uz: "Amal" },
        "Complexes": { ru: "Дома", uz: "Uylar" },
        "Generated": { ru: "Дата выгрузки", uz: "Yuklab olish vaqti" },
        "Export date": { ru: "Дата выгрузки", uz: "Yuklab olish sanasi" },
        "Scheduled": { ru: "Запланировано", uz: "Rejalashtirilgan" },
        "In Progress": { ru: "В работе", uz: "Jarayonda" },
        "Completed": { ru: "Завершено", uz: "Bajarildi" },
        "Deferred": { ru: "Отложено", uz: "Kechiktirildi" },
        "Success": { ru: "Успешно", uz: "Muvaffaqiyatli" },
        "Pending": { ru: "Ожидает", uz: "Kutilmoqda" },
        "Failed": { ru: "Ошибка", uz: "Xato" },
        "Utility Payment": { ru: "Коммунальный платеж", uz: "Kommunal to'lov" },
        "Maintenance Fee": { ru: "Плата за обслуживание", uz: "Xizmat to'lovi" },
        "Late Penalty": { ru: "Пеня за просрочку", uz: "Kechikish jarimasi" },
        "Pressure Drop Detected": { ru: "Обнаружено падение давления", uz: "Bosim pasayishi aniqlandi" },
        "Secondary Pump Offline": { ru: "Вторичный насос отключён", uz: "Ikkinchi nasos o'chirilgan" },
        "Sensor Calibration": { ru: "Калибровка датчика", uz: "Sensor kalibrlash" },
        "Pipe Retrofitting": { ru: "Модернизация трубы", uz: "Quvurni yangilash" },
        "Thermal Core Flush": { ru: "Промывка теплового узла", uz: "Issiqlik uzelini yuvish" },
        "Skyline Residences - Block B": { ru: "Skyline Residences - блок B", uz: "Skyline Residences - B blok" },
        "Industrial Sector 4": { ru: "Индустриальный сектор 4", uz: "Sanoat sektori 4" },
        "Vista Towers - 09:00": { ru: "Vista Towers - 09:00", uz: "Vista Towers - 09:00" },
        "Zone Delta - 13:30": { ru: "Zone Delta - 13:30", uz: "Zone Delta - 13:30" },
        "Main Hub - 22:00": { ru: "Главный узел - 22:00", uz: "Asosiy uzel - 22:00" },
        "Act now": { ru: "Действовать", uz: "Chora ko'rish" },
        "Inspect": { ru: "Проверить", uz: "Tekshirish" },
        "Open schedule": { ru: "Открыть график", uz: "Jadvalni ochish" },
        "Plan crew": { ru: "Назначить бригаду", uz: "Brigadani rejalash" },
        "Prepare": { ru: "Подготовить", uz: "Tayyorlash" },
        "Complex Performance Overview": { ru: "Обзор эффективности домов", uz: "Uylar samaradorligi sharhi" },
        "Recent Transaction Log": { ru: "Журнал последних транзакций", uz: "So'nggi tranzaksiyalar jurnali" },
        "System Maintenance Log": { ru: "Журнал обслуживания систем", uz: "Tizim xizmat jurnali" },
        "Residential Complex Management | HydroFlow": { ru: "Управление домами | HydroFlow", uz: "Uylar boshqaruvi | HydroFlow" },
        "Billing & Debt | HydroFlow": { ru: "Платежи и долги | HydroFlow", uz: "To'lovlar va qarzlar | HydroFlow" },
        "System Health | HydroFlow": { ru: "Состояние систем | HydroFlow", uz: "Tizim holati | HydroFlow" },
        "Analytics | HydroFlow": { ru: "Аналитика | HydroFlow", uz: "Analitika | HydroFlow" },
        "Last 90 days": { ru: "Последние 90 дней", uz: "So'nggi 90 kun" },
        "Current page summary": { ru: "Сводка текущей страницы", uz: "Joriy sahifa xulosasi" },
        "visible rows": { ru: "видимые строки", uz: "ko'rinadigan qatorlar" },
    };
    const exportLang = () => storage.getItem("hydroflow-lang") || "en";
    const exportLabel = (key) => exportLabelMap[key]?.[exportLang()] || exportLabelMap[key]?.en || key;
    const exportValue = (value) => typeof value === "string" ? exportLabel(value) : value;
    const localizedRows = (rows) => rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [exportLabel(key), exportValue(value)])));
    const ownerPool = billingData.residents.map((resident) => ({
        name: resident.name,
        phone: resident.phone,
        email: `${resident.name.toLowerCase().replace(/\s+/g, ".")}@hydroflow.local`,
    }));
    const exportDistricts = Object.fromEntries(getComplexStats().map((complex) => [complex.id, {
        complex: complex.name,
        sector: complex.sector,
        prefix: complex.prefix,
        count: complex.buildings,
        units: complex.units,
        risk: complex.risk,
        debt: complex.debt,
        issueEvery: complex.issueEvery,
    }]));
    const formatUzs = (value) => `${Number(value || 0).toLocaleString("en-US")} UZS`;
    const unitsForBuilding = (district, index) => {
        const base = Math.floor(district.units / district.count);
        const remainder = district.units % district.count;
        return base + (index <= remainder ? 1 : 0);
    };
    const buildingName = (district, index) => `${district.prefix} ${String.fromCharCode(64 + index)}`;
    const ownerFor = (buildingIndex, unitIndex) => ownerPool[(buildingIndex + unitIndex) % ownerPool.length];
    const apartmentForExport = (districtId, buildingIndex, unitIndex) => {
        const district = exportDistricts[districtId];
        const owner = ownerFor(buildingIndex, unitIndex);
        const floor = Math.floor((unitIndex - 1) / 4) + 2;
        const door = ((unitIndex - 1) % 4) + 1;
        const unit = `${floor}0${door}-${String.fromCharCode(64 + buildingIndex)}`;
        const isDebtor = districtId === "harbor" ? unitIndex % 4 === 0 : unitIndex % 7 === 0;
        const balance = isDebtor ? -(680000 + (unitIndex * 123000)) : (unitIndex % 5 === 0 ? 0 : 1240000 + (unitIndex * 35000));
        return {
            unit,
            owner,
            balance,
            status: isDebtor ? "Overdue" : "Paid",
            rooms: `${2 + (unitIndex % 3)} rooms`,
            area: `${58 + (unitIndex % 8) * 6} m²`,
            charge: formatUzs(980000 + (unitIndex % 6) * 110000),
            meter: `HF-${districtId.slice(0, 3).toUpperCase()}-${buildingIndex}${String(unitIndex).padStart(2, "0")}`,
            contract: `HF-${9000 + buildingIndex * 100 + unitIndex}`,
            visit: `${String(8 + (unitIndex % 6)).padStart(2, "0")}.04.2026`,
            lastPayment: `${String(1 + (unitIndex % 13)).padStart(2, "0")}.04.2026`,
            occupancy: unitIndex % 9 === 0 ? "Owner away" : "Resident",
        };
    };
    const buildExportData = () => {
        const exportedAt = new Date();
        const exportedAtIso = exportedAt.toISOString();
        const exportedAtLocal = exportedAt.toLocaleString("en-GB", { timeZone: "Asia/Tashkent", hour12: false });
        const complexes = [];
        const houses = [];
        const apartments = [];
        const residents = [];
        Object.entries(exportDistricts).forEach(([districtId, district]) => {
            let districtDebt = 0;
            let districtDebtors = 0;
            for (let buildingIndex = 1; buildingIndex <= district.count; buildingIndex += 1) {
                const unitCount = unitsForBuilding(district, buildingIndex);
                const healthIssue = district.issueEvery && buildingIndex % district.issueEvery === 0;
                const debt = Math.round(district.debt / district.count) + (healthIssue ? 4200000 : buildingIndex * 175000);
                const building = buildingName(district, buildingIndex);
                const completion = Math.max(78, Math.min(99, 93 + (buildingIndex % 6) - (healthIssue ? 9 : 0)));
                districtDebt += debt;
                houses.push({
                    "ЖК": district.complex,
                    "Сектор": district.sector,
                    "Дом": building,
                    "Квартир": unitCount,
                    "Этажей": 8 + (buildingIndex % 5),
                    "Подъезд": buildingIndex % 2 ? "A" : "B",
                    "Системы": healthIssue ? "Review" : "Optimal",
                    "System Health": `${completion}%`,
                    "Долг дома": formatUzs(debt),
                    "Дата выгрузки": exportedAtLocal,
                });
                for (let unitIndex = 1; unitIndex <= unitCount; unitIndex += 1) {
                    const apartment = apartmentForExport(districtId, buildingIndex, unitIndex);
                    apartments.push({
                        "ЖК": district.complex,
                        "Дом": building,
                        "Квартира": apartment.unit,
                        "Статус": apartment.status,
                        "Проживание": apartment.occupancy,
                        "Площадь": apartment.area,
                        "Комнат": apartment.rooms,
                        "Счетчик": apartment.meter,
                        "Начисление": apartment.charge,
                        "Баланс": formatUzs(apartment.balance),
                        "Последний платеж": apartment.lastPayment,
                        "Последний визит": apartment.visit,
                        "Дата выгрузки": exportedAtLocal,
                    });
                    residents.push({
                        "ЖК": district.complex,
                        "Дом": building,
                        "Квартира": apartment.unit,
                        "Резидент": apartment.owner.name,
                        "Телефон": apartment.owner.phone,
                        "Email": apartment.owner.email,
                        "Контракт": apartment.contract,
                        "Статус оплаты": apartment.status,
                        "Баланс": formatUzs(apartment.balance),
                        "Последний платеж": apartment.lastPayment,
                        "Последний визит": apartment.visit,
                        "Дата выгрузки": exportedAtLocal,
                    });
                    if (apartment.balance < 0) districtDebtors += 1;
                }
            }
            complexes.push({
                "ЖК": district.complex,
                "Сектор": district.sector,
                "Домов": district.count,
                "Квартир": district.units,
                "Риск": district.risk,
                "Долг ЖК": formatUzs(districtDebt),
                "Должников": districtDebtors,
                "Дата выгрузки": exportedAtLocal,
            });
        });
        const report = [{
            "Источник": lastExportSource,
            "Формат": selectedExportFormat,
            "Таймзона": "Asia/Tashkent",
            "Дата выгрузки (локально)": exportedAtLocal,
            "Дата выгрузки (ISO)": exportedAtIso,
            "ЖК": complexes.length,
            "Домов": houses.length,
            "Квартир": apartments.length,
            "Резидентов": residents.length,
            "Видимых строк в таблице": getVisibleTableRows().length,
        }];
        return { complexes, houses, apartments, residents, report };
    };
    const parseBillingTransactions = () => {
        const scopedHost = lastExportContext === "transactions" ? getExportHostFromButton(lastExportButton) : null;
        const scopedTable = scopedHost && scopedHost !== document
            ? (scopedHost.matches("table") ? scopedHost : scopedHost.querySelector("table"))
            : null;
        const table = scopedTable || Array.from(document.querySelectorAll("table")).find((candidate) => {
            const title = candidate.closest(".bg-surface-container-lowest")?.querySelector("h3")?.textContent?.trim().toLowerCase() || "";
            return title.includes("transaction");
        });
        if (!table) return [];
        return Array.from(table.querySelectorAll("tbody tr")).filter((row) => !row.classList.contains("hidden")).map((row) => {
            const cells = Array.from(row.querySelectorAll("td")).filter((cell) => !cell.querySelector("[data-row-select]"));
            return {
                "Резидент": cells[0]?.querySelector("p")?.textContent.trim() || "",
                "Счет": cells[0]?.querySelector("p.text-\\[10px\\]")?.textContent.trim() || cells[0]?.querySelectorAll("p")[1]?.textContent.trim() || "",
                "Тип": cells[1]?.textContent.trim() || "",
                "Дата": cells[2]?.textContent.trim() || "",
                "Сумма": cells[3]?.textContent.trim() || "",
                "Статус": cells[4]?.textContent.trim() || "",
            };
        });
    };
    const parseDebtHealth = () => Array.from(document.querySelectorAll(".revenue-debt-card [data-sector-top-house-row]")).map((item) => {
        const lines = item.querySelectorAll("span.block");
        return {
            "Объект": lines[0]?.textContent.trim() || "",
            "Состояние": lines[1]?.textContent.trim() || "",
            "Процент": item.querySelector(".percent-meter")?.dataset.value || "",
        };
    });
    const parseDebtorResidents = () => Array.from(document.querySelectorAll("[data-resident-card][data-resident-status='debtor']")).map((card) => {
        const name = card.querySelector("h4")?.textContent.trim() || "";
        const unit = card.querySelector("p.text-xs")?.textContent.trim() || "";
        const balance = card.querySelector(".text-xl.font-black")?.textContent.trim() || "";
        const details = card.querySelectorAll(".bg-white\\/40 p");
        const phone = details[0]?.querySelectorAll("span")[1]?.textContent.trim() || "";
        const lastPayment = details[1]?.querySelectorAll("span")[1]?.textContent.trim() || "";
        return {
            "Резидент": name,
            "Квартира": unit,
            "Баланс": balance,
            "Телефон": phone,
            "Последний платеж": lastPayment,
        };
    });
    const parseSystemMaintenanceLog = () => {
        const scopedHost = lastExportContext === "maintenance" ? getExportHostFromButton(lastExportButton) : null;
        const scopedTable = scopedHost && scopedHost !== document
            ? (scopedHost.matches("table") ? scopedHost : scopedHost.querySelector("table"))
            : null;
        const table = scopedTable || Array.from(document.querySelectorAll("table")).find((candidate) => {
            const title = candidate.closest("section, .bg-surface-container-lowest")?.querySelector("h3,h4")?.textContent?.trim().toLowerCase() || "";
            return title.includes("system maintenance log");
        });
        if (!table) return [];
        return Array.from(table.querySelectorAll("tbody tr"))
            .filter((row) => !row.classList.contains("hidden") && !row.dataset.smartEmpty)
            .filter((row) => row.matches("[data-maintenance-row]") || !table.querySelector("[data-maintenance-row]"))
            .map((row) => {
            const cells = Array.from(row.querySelectorAll("td")).filter((cell) => !cell.querySelector("[data-row-select]"));
            return {
                "Task": cells[0]?.textContent.trim().replace(/\s+/g, " ") || "",
                "Location": cells[1]?.textContent.trim().replace(/\s+/g, " ") || "",
                "Priority": cells[2]?.textContent.trim().replace(/\s+/g, " ") || "",
                "Date / Time": cells[3]?.textContent.trim().replace(/\s+/g, " ") || "",
                "Status": cells[4]?.textContent.trim().replace(/\s+/g, " ") || "",
                "Action": cells[5]?.textContent.trim().replace(/\s+/g, " ") || "",
            };
        });
    };
    const buildRealMaintenanceRows = () => (Array.isArray(billingData.maintenanceTasks) ? billingData.maintenanceTasks : [])
        .slice()
        .sort((a, b) => dateValue(a.date) - dateValue(b.date))
        .map((task) => ({
            "Task": task.task || task.title || "",
            "Location": task.location || "",
            "Priority": task.priority || "",
            "Date / Time": task.date || "",
            "Status": task.status || "",
            "Assigned to": task.assignedTo || "",
            "Action": task.action || "",
        }));
    const buildSystemMaintenanceExportData = () => {
        const exportedAt = new Date();
        const exportedAtIso = exportedAt.toISOString();
        const exportedAtLocal = exportedAt.toLocaleString("en-GB", { timeZone: "Asia/Tashkent", hour12: false });
        const realMaintenance = buildRealMaintenanceRows();
        const maintenance = realMaintenance.length ? realMaintenance : parseSystemMaintenanceLog();
        const report = [{
            "Источник": lastExportSource,
            "Формат": selectedExportFormat,
            "Таймзона": "Asia/Tashkent",
            "Дата выгрузки (локально)": exportedAtLocal,
            "Дата выгрузки (ISO)": exportedAtIso,
            "Maintenance rows": maintenance.length,
        }];
        return {
            complexes: [],
            houses: [],
            apartments: maintenance,
            residents: [],
            maintenanceLog: true,
            report,
        };
    };
    const buildUsageReportExportData = () => {
        const exportedAt = new Date();
        const exportedAtIso = exportedAt.toISOString();
        const exportedAtLocal = exportedAt.toLocaleString("en-GB", { timeZone: "Asia/Tashkent", hour12: false });
        const stats = getSiteStats();
        const activeAlertsByComplex = (Array.isArray(billingData.systemAlerts) ? billingData.systemAlerts : [])
            .filter((alert) => !["resolved", "archived"].includes(String(alert.status || "").toLowerCase()))
            .reduce((map, alert) => {
                const key = String(alert.complexId || "");
                map[key] = (map[key] || 0) + 1;
                return map;
            }, {});
        const complexes = billingData.complexes.slice().sort((a, b) => (b.waterM3 + b.heatingM3) - (a.waterM3 + a.heatingM3)).map((complex) => ({
            "Complex": complex.name,
            "Sector": complex.sector,
            "Units": complex.units,
            "Water Usage (m³)": Number(complex.waterM3 || 0).toFixed(2),
            "Heating Usage (m³)": Number(complex.heatingM3 || 0).toFixed(2),
            "Total Usage (m³)": Number((complex.waterM3 || 0) + (complex.heatingM3 || 0)).toFixed(2),
            "Pressure (PSI)": Number(complex.pressurePsi || 0).toFixed(1),
            "Health": percentValue(complex.health),
            "Risk": complex.risk || "",
            "Alert Count": activeAlertsByComplex[String(complex.id || "")] || 0,
        }));
        const report = [{
            "Источник": lastExportSource || "Usage Report",
            "Формат": selectedExportFormat,
            "Таймзона": "Asia/Tashkent",
            "Дата выгрузки (локально)": exportedAtLocal,
            "Дата выгрузки (ISO)": exportedAtIso,
            "Usage rows": complexes.length,
            "Total Usage (m³)": Number(stats.totalUsageM3 || 0).toFixed(2),
            "Pressure (PSI)": Number(stats.avgPressure || 0).toFixed(1),
            "Alert Count": stats.activeAlerts || 0,
        }];
        return {
            complexes,
            houses: [],
            apartments: [],
            residents: [],
            usageReport: true,
            report,
        };
    };
    const buildRealBillingRows = () => billingData.transactions.slice()
        .sort((a, b) => dateValue(b.date) - dateValue(a.date))
        .map((transaction) => ({
            "Резидент": transaction.resident,
            "Счет": transaction.invoice,
            "Тип": transaction.type,
            "Дата": transaction.date,
            "Сумма": formatBillingUzs(transaction.amount),
            "Статус": transaction.status,
        }));
    const buildRealDebtRows = () => getSingleSectorStats().buildingItems.slice()
        .map((building, index) => {
            const apartments = Array.isArray(building.apartments) ? building.apartments : [];
            const fallbackDebt = apartments.reduce((total, apartment) => {
                const balance = Number(apartment.balance || 0);
                return total + (balance < 0 ? Math.abs(balance) : 0);
            }, 0);
            const fallbackDebtors = apartments.filter((apartment) => Number(apartment.balance || 0) < 0).length;
            const debt = Number.isFinite(Number(building.debt)) ? Number(building.debt) : fallbackDebt;
            const debtors = Number.isFinite(Number(building.debtorResidents)) ? Number(building.debtorResidents) : fallbackDebtors;
            return {
                "Объект": building.name || `House ${building.number || index + 1}`,
                "Состояние": building.risk || riskForHealth(Number(building.health) || 0),
                "Процент": percentValue(Number(building.health) || 0),
                "Долг": formatBillingUzs(debt),
                "Должников": debtors,
            };
        })
        .sort((a, b) => {
            const left = Number(String(b["Долг"]).replace(/[^\d.-]/g, "")) || 0;
            const right = Number(String(a["Долг"]).replace(/[^\d.-]/g, "")) || 0;
            return left - right;
        });
        const buildRealDebtorRows = () => billingData.residents
        .filter((resident) => resident.balance < 0)
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
        .map((resident) => {
            const complex = billingData.complexes.find((item) => item.id === resident.complexId);
            return {
                "Резидент": resident.name,
                "ЖК": complex?.name || "",
                "Квартира": resident.apartment,
                "Баланс": formatBillingUzs(resident.balance),
                "Телефон": resident.phone,
                "Последний платеж": resident.lastPayment,
                "Действие": "Send reminder",
            };
        });
    const buildDebtLettersExportData = () => {
        const exportedAt = new Date();
        const exportedAtIso = exportedAt.toISOString();
        const exportedAtLocal = exportedAt.toLocaleString("en-GB", { timeZone: "Asia/Tashkent", hour12: false });
        const debtors = buildRealDebtorRows();
        const debt = buildRealDebtRows();
        const report = [{
            "Источник": lastExportSource || "Debt Letters",
            "Формат": selectedExportFormat,
            "Таймзона": "Asia/Tashkent",
            "Дата выгрузки (локально)": exportedAtLocal,
            "Дата выгрузки (ISO)": exportedAtIso,
            "Debtors": debtors.length,
            "Debt rows": debt.length,
            "Total debt": formatBillingUzs(getSiteStats().totalDebt),
        }];
        return {
            complexes: [],
            houses: [],
            apartments: [],
            residents: debtors,
            debt,
            debtLetters: true,
            report,
        };
    };
    const buildBillingDebtExportData = () => {
        const exportedAt = new Date();
        const exportedAtIso = exportedAt.toISOString();
        const exportedAtLocal = exportedAt.toLocaleString("en-GB", { timeZone: "Asia/Tashkent", hour12: false });
        const parsedBilling = parseBillingTransactions();
        const billing = parsedBilling.length ? parsedBilling : buildRealBillingRows();
        const isTransactionLog = lastExportContext === "transactions" || (lastExportSource || "").toLowerCase().includes("transaction");
        const parsedDebt = parseDebtHealth();
        const parsedDebtors = parseDebtorResidents();
        const debt = parsedDebt.length ? parsedDebt : buildRealDebtRows();
        const debtors = parsedDebtors.length ? parsedDebtors : buildRealDebtorRows();
        const report = [{
            "Источник": lastExportSource,
            "Формат": selectedExportFormat,
            "Таймзона": "Asia/Tashkent",
            "Дата выгрузки (локально)": exportedAtLocal,
            "Дата выгрузки (ISO)": exportedAtIso,
            "Billing rows": billing.length,
            "Debt rows": isTransactionLog ? 0 : debt.length,
            "Debtors": isTransactionLog ? 0 : debtors.length,
        }];
        if (isTransactionLog) {
            return {
                complexes: [],
                houses: [],
                apartments: billing,
                residents: [],
                debt: [],
                transactionLog: true,
                report,
            };
        }
        return {
            complexes: [],
            houses: [],
            apartments: billing,
            residents: debtors,
            debt,
            report,
        };
    };
    const getExportDataForContext = () => {
        const source = (lastExportSource || "").toLowerCase();
        const path = window.location.pathname.toLowerCase();

        if (lastExportContext === "debt-letters" || source.includes("debt letters")) {
            return buildDebtLettersExportData();
        }
        if (lastExportContext === "usage-report" || source.includes("usage report")) {
            return buildUsageReportExportData();
        }
        if (lastExportContext === "maintenance" || source.includes("system maintenance log") || source.includes("maintenance log")) {
            return buildSystemMaintenanceExportData();
        }
        if (lastExportContext === "transactions" || source.includes("transaction")) {
            return buildBillingDebtExportData();
        }
        if (lastExportContext === "residential") {
            return buildExportData();
        }
        if (lastExportContext === "billing") {
            return buildBillingDebtExportData();
        }

        // Strict section scoping: Billing/Debt exports must never fallback to residential units dataset.
        if (path.includes("/billing") || source.includes("billing") || source.includes("debt") || source.includes("transaction")) {
            return buildBillingDebtExportData();
        }

        if (path.includes("/residential")) {
            return buildExportData();
        }

        const hasBillingDebtWidgets = Boolean(document.querySelector(".revenue-debt-card")) && Boolean(document.querySelector("[data-resident-card]"));
        if (hasBillingDebtWidgets) {
            return buildBillingDebtExportData();
        }
        return buildExportData();
    };
    const csvEscape = (value) => {
        const prepared = String(value ?? "");
        return /[",\n]/.test(prepared) ? `"${prepared.replace(/"/g, '""')}"` : prepared;
    };
    const jsonToCsv = (rows) => {
        if (!rows.length) return "";
        const headers = Object.keys(rows[0]);
        const lines = rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","));
        return [headers.join(","), ...lines].join("\n");
    };
    const xmlEscape = (value) => String(value ?? "").replace(/[<>&'"]/g, (char) => ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
    }[char]));
    const sheetXml = (name, rows) => {
        const displayRows = localizedRows(rows);
        if (!displayRows.length) return `<Worksheet ss:Name="${xmlEscape(exportLabel(name))}"><Table></Table></Worksheet>`;
        const headers = Object.keys(displayRows[0]);
        const columns = headers.map((header) => {
            const sample = displayRows.slice(0, 8).reduce((max, row) => Math.max(max, String(row[header] ?? "").length), header.length);
            const width = Math.max(92, Math.min(210, sample * 8.5 + 28));
            return `<Column ss:AutoFitWidth="0" ss:Width="${width.toFixed(0)}"/>`;
        }).join("");
        const headerRow = `<Row>${headers.map((header) => `<Cell><Data ss:Type="String">${xmlEscape(header)}</Data></Cell>`).join("")}</Row>`;
        const dataRows = displayRows.map((row) => `<Row>${headers.map((header) => `<Cell><Data ss:Type="String">${xmlEscape(row[header])}</Data></Cell>`).join("")}</Row>`).join("");
        return `<Worksheet ss:Name="${xmlEscape(exportLabel(name))}"><Table>${columns}${headerRow}${dataRows}</Table></Worksheet>`;
    };
    const createExcelXmlWorkbook = (datasets) => {
        const sheets = datasets.usageReport
            ? `${sheetXml("Usage Report", datasets.complexes)}
${sheetXml("Report", datasets.report)}`
            : datasets.maintenanceLog
            ? `${sheetXml("Maintenance", datasets.apartments)}
${sheetXml("Report", datasets.report)}`
            : datasets.transactionLog
            ? `${sheetXml("Transactions", datasets.apartments)}
${sheetXml("Report", datasets.report)}`
            : datasets.debtLetters
            ? `${sheetXml("Debtors", datasets.residents)}
${sheetXml("Debt", datasets.debt)}
${sheetXml("Report", datasets.report)}`
            : `${sheetXml("ЖК", datasets.complexes)}
${sheetXml("Дома", datasets.houses)}
${sheetXml(datasets.debt ? "Billing" : "Квартиры", datasets.apartments)}
${sheetXml(datasets.debt ? "Debtors" : "Резиденты", datasets.residents)}
${datasets.debt ? sheetXml("Debt", datasets.debt) : ""}
${sheetXml("Отчёт", datasets.report)}`;
        return `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
${sheets}
</Workbook>`;
    };
    const createPdfReportLines = (datasets) => {
        const formatRow = (values, widths) => values.map((value, index) => {
            const text = String(exportValue(value) ?? "");
            const width = widths[index] || 16;
            return text.length > width ? `${text.slice(0, width - 1)}~` : text.padEnd(width, " ");
        }).join(" | ");
        const sectionLine = (title) => [
            "",
            "============================================================",
            ` ${title}`,
            "============================================================",
        ];
        const lines = [];
        const report = datasets.report[0] || {};
        lines.push(exportLabel("HydroFlow export report"));
        lines.push(`${exportLabel("Source")}: ${exportValue(report["Источник"]) || "-"}`);
        lines.push(`${exportLabel("Generated (local)")}: ${report["Дата выгрузки (локально)"] || "-"}`);
        lines.push(`${exportLabel("Generated (ISO)")}: ${report["Дата выгрузки (ISO)"] || "-"}`);
        lines.push(`${exportLabel("Timezone")}: ${report["Таймзона"] || "Asia/Tashkent"}`);
        if (datasets.usageReport) {
            lines.push(`${exportLabel("Usage rows")}: ${report["Usage rows"] || 0}`);
            lines.push(`${exportLabel("Total Usage (m³)")}: ${report["Total Usage (m³)"] || "-"}`);
            lines.push(`${exportLabel("Pressure (PSI)")}: ${report["Pressure (PSI)"] || "-"}`);
            lines.push(`${exportLabel("Alert Count")}: ${report["Alert Count"] || 0}`);
            lines.push(...sectionLine(exportLabel("Usage Report")));
            lines.push(formatRow(["Complex", "Sector", "Units", "Water Usage (m³)", "Heating Usage (m³)", "Total Usage (m³)", "Pressure (PSI)", "Health", "Risk", "Alert Count"].map(exportLabel), [18, 16, 8, 14, 16, 15, 12, 10, 12, 10]));
            lines.push("------------------------------------------------------------");
            datasets.complexes.forEach((row) => {
                lines.push(formatRow(
                    [row.Complex, row.Sector, row.Units, row["Water Usage (m³)"], row["Heating Usage (m³)"], row["Total Usage (m³)"], row["Pressure (PSI)"], row.Health, row.Risk, row["Alert Count"]],
                    [18, 16, 8, 14, 16, 15, 12, 10, 12, 10]
                ));
            });
            return lines;
        }
        if (datasets.maintenanceLog) {
            lines.push(`${exportLabel("Maintenance rows")}: ${report["Maintenance rows"] || 0}`);
            lines.push(...sectionLine(exportLabel("Maintenance")));
            lines.push(formatRow(["Task", "Location", "Priority", "Date / Time", "Status", "Action"].map(exportLabel), [16, 16, 10, 14, 10, 12]));
            lines.push("------------------------------------------------------------");
            datasets.apartments.forEach((row) => {
                lines.push(formatRow(
                    [row.Task, row.Location, row.Priority, row["Date / Time"], row.Status, row.Action],
                    [16, 16, 10, 14, 10, 12]
                ));
            });
            return lines;
        }
        if (datasets.transactionLog) {
            lines.push(`${exportLabel("Transactions")}: ${report["Billing rows"] || 0}`);
            lines.push(...sectionLine(exportLabel("Transactions")));
            lines.push(formatRow(["Resident", "Invoice", "Type", "Date", "Amount", "Status"].map(exportLabel), [16, 12, 14, 12, 16, 10]));
            lines.push("------------------------------------------------------------");
            datasets.apartments.forEach((row) => {
                lines.push(formatRow(
                    [row["Резидент"], row["Счет"], row["Тип"], row["Дата"], row["Сумма"], row["Статус"]],
                    [16, 12, 14, 12, 16, 10]
                ));
            });
            return lines;
        }
        if (datasets.debtLetters) {
            lines.push(`${exportLabel("Debtors")}: ${report["Debtors"] || 0}, ${exportLabel("Total debt")}: ${report["Total debt"] || "-"}`);
            lines.push(...sectionLine(exportLabel("Debtors")));
            lines.push(formatRow(["Resident", "Complex", "Apartment", "Balance", "Phone", "Last payment"].map(exportLabel), [18, 18, 14, 16, 14, 12]));
            lines.push("------------------------------------------------------------");
            datasets.residents.forEach((row) => {
                lines.push(formatRow(
                    [row["Резидент"], row["ЖК"], row["Квартира"], row["Баланс"], row["Телефон"], row["Последний платеж"]],
                    [18, 18, 14, 16, 14, 12]
                ));
            });
            lines.push(...sectionLine(exportLabel("Debt")));
            lines.push(formatRow(["Object", "Health status", "Percent", "Debt", "Debtors"].map(exportLabel), [20, 14, 10, 16, 8]));
            lines.push("------------------------------------------------------------");
            datasets.debt.forEach((row) => {
                lines.push(formatRow([row["Объект"], row["Состояние"], row["Процент"], row["Долг"], row["Должников"]], [20, 14, 10, 16, 8]));
            });
            return lines;
        }
        if (datasets.debt) {
            lines.push(`${exportLabel("Billing rows")}: ${report["Billing rows"] || 0}, ${exportLabel("Debt rows")}: ${report["Debt rows"] || 0}, ${exportLabel("Debtors")}: ${report["Debtors"] || 0}`);
            lines.push(...sectionLine(exportLabel("Billing")));
            lines.push(formatRow(["Resident", "Invoice", "Type", "Date", "Amount", "Status"].map(exportLabel), [16, 12, 14, 12, 16, 10]));
            lines.push("------------------------------------------------------------");
            datasets.apartments.forEach((row) => {
                lines.push(formatRow(
                    [row["Резидент"], row["Счет"], row["Тип"], row["Дата"], row["Сумма"], row["Статус"]],
                    [16, 12, 14, 12, 16, 10]
                ));
            });
            lines.push(...sectionLine(exportLabel("Debt")));
            lines.push(formatRow(["Object", "Health status", "Percent"].map(exportLabel), [24, 20, 10]));
            lines.push("------------------------------------------------------------");
            (datasets.debt || []).forEach((row) => {
                lines.push(formatRow([row["Объект"], row["Состояние"], row["Процент"]], [24, 20, 10]));
            });
            lines.push(...sectionLine(exportLabel("Debtors")));
            lines.push(formatRow(["Resident", "Apartment", "Balance", "Phone", "Last payment"].map(exportLabel), [18, 14, 16, 14, 12]));
            lines.push("------------------------------------------------------------");
            datasets.residents.forEach((row) => {
                lines.push(formatRow(
                    [row["Резидент"], row["Квартира"], row["Баланс"], row["Телефон"], row["Последний платеж"]],
                    [18, 14, 16, 14, 12]
                ));
            });
            return lines;
        }
        lines.push(`${exportLabel("Complexes")}: ${report["ЖК"] || 0}, ${exportLabel("Houses")}: ${report["Домов"] || 0}, ${exportLabel("Apartments")}: ${report["Квартир"] || 0}, ${exportLabel("Residents")}: ${report["Резидентов"] || 0}`);
        lines.push(...sectionLine(exportLabel("Complex")));
        lines.push(formatRow(["Complex", "Sector", "Houses", "Units", "Risk", "Debt"].map(exportLabel), [18, 16, 6, 7, 12, 20]));
        lines.push("------------------------------------------------------------");
        datasets.complexes.forEach((row) => {
            lines.push(formatRow(
                [row["ЖК"], row["Сектор"], row["Домов"], row["Квартир"], row["Риск"], row["Долг ЖК"]],
                [18, 16, 6, 7, 12, 20]
            ));
        });
        lines.push(...sectionLine(exportLabel("Houses")));
        lines.push(formatRow(["Complex", "House", "Units", "Floors", "Health", "Debt"].map(exportLabel), [16, 16, 6, 6, 8, 20]));
        lines.push("------------------------------------------------------------");
        datasets.houses.forEach((row) => {
            lines.push(formatRow(
                [row["ЖК"], row["Дом"], row["Квартир"], row["Этажей"], row["System Health"], row["Долг дома"]],
                [16, 16, 6, 6, 8, 20]
            ));
        });
        lines.push(...sectionLine(exportLabel("Apartments")));
        lines.push(formatRow(["Complex", "House", "Unit", "Status", "Balance", "Last payment"].map(exportLabel), [16, 14, 8, 10, 16, 12]));
        lines.push("------------------------------------------------------------");
        datasets.apartments.forEach((row) => {
            lines.push(formatRow(
                [row["ЖК"], row["Дом"], row["Квартира"], row["Статус"], row["Баланс"], row["Последний платеж"]],
                [16, 14, 8, 10, 16, 12]
            ));
        });
        lines.push(...sectionLine(exportLabel("Residents")));
        lines.push(formatRow(["Resident", "Complex", "House", "Unit", "Phone", "Balance"].map(exportLabel), [18, 14, 14, 8, 14, 16]));
        lines.push("------------------------------------------------------------");
        datasets.residents.forEach((row) => {
            lines.push(formatRow(
                [row["Резидент"], row["ЖК"], row["Дом"], row["Квартира"], row["Телефон"], row["Баланс"]],
                [18, 14, 14, 8, 14, 16]
            ));
        });
        return lines;
    };
    const escapeSvgText = (value) => String(value ?? "").replace(/[&<>"]/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
    }[char]));
    const bytesToHex = (binary) => {
        let hex = "";
        for (let i = 0; i < binary.length; i += 1) {
            hex += binary.charCodeAt(i).toString(16).padStart(2, "0");
        }
        return hex;
    };
    const renderPdfPageToImage = (pageLines, pageNumber, pageCount) => new Promise((resolve) => {
        const width = 794;
        const height = 1123;
        const lineHeight = 22;
        const textLines = pageLines.map((line, index) => (
            `<text xml:space="preserve" x="48" y="${92 + index * lineHeight}" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="${index < 5 ? 700 : 500}" fill="#111827">${escapeSvgText(line)}</text>`
        )).join("");
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  <rect x="28" y="28" width="${width - 56}" height="${height - 56}" rx="20" fill="#f8fafc" stroke="#e5e7eb"/>
  <text x="48" y="56" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="800" letter-spacing="2" fill="#64748b">${escapeSvgText(exportLabel("REPORT"))}</text>
  ${textLines}
  <text x="${width - 96}" y="${height - 38}" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="700" fill="#94a3b8">${pageNumber} / ${pageCount}</text>
</svg>`;
        const image = new Image();
        const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);
            URL.revokeObjectURL(url);
            const binary = atob(canvas.toDataURL("image/jpeg", 0.92).split(",")[1] || "");
            resolve({ hex: bytesToHex(binary), width, height });
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({ hex: "", width, height });
        };
        image.src = url;
    });
    const createPdfFromLines = async (rawLines) => {
        const lines = rawLines.map((line) => String(line ?? "").slice(0, 170));
        const linesPerPage = 40;
        const pageChunks = [];
        for (let i = 0; i < lines.length; i += linesPerPage) {
            pageChunks.push(lines.slice(i, i + linesPerPage));
        }
        if (!pageChunks.length) pageChunks.push([exportLabel("HydroFlow export report")]);

        const renderedPages = [];
        for (let index = 0; index < pageChunks.length; index += 1) {
            renderedPages.push(await renderPdfPageToImage(pageChunks[index], index + 1, pageChunks.length));
        }

        const objects = [
            "<< /Type /Catalog /Pages 2 0 R >>",
            "",
        ];
        const kids = [];
        renderedPages.forEach((page, index) => {
            const pageObject = objects.length + 1;
            const contentObject = pageObject + 1;
            const imageObject = pageObject + 2;
            const imageName = `Im${index + 1}`;
            const content = `q\n595 0 0 842 0 0 cm\n/${imageName} Do\nQ`;
            kids.push(`${pageObject} 0 R`);
            objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /${imageName} ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>`);
            objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
            objects.push(`<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${page.hex.length + 1} >>\nstream\n${page.hex}>\nendstream`);
        });
        objects[1] = `<< /Type /Pages /Count ${kids.length} /Kids [${kids.join(" ")}] >>`;

        let pdf = "%PDF-1.4\n";
        const offsets = [0];
        objects.forEach((objectContent, index) => {
            offsets.push(pdf.length);
            pdf += `${index + 1} 0 obj\n${objectContent}\nendobj\n`;
        });
        const xrefStart = pdf.length;
        pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
        offsets.slice(1).forEach((offset) => {
            pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
        });
        pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
        return pdf;
    };
    const buildSectionedCsv = (datasets) => {
        const sections = datasets.usageReport
            ? [
                { title: "REPORT", rows: datasets.report },
                { title: "Usage Report", rows: datasets.complexes },
            ]
            : datasets.maintenanceLog
            ? [
                { title: "REPORT", rows: datasets.report },
                { title: "SYSTEM_MAINTENANCE_LOG", rows: datasets.apartments },
            ]
            : datasets.transactionLog
            ? [
                { title: "REPORT", rows: datasets.report },
                { title: "RECENT_TRANSACTION_LOG", rows: datasets.apartments },
            ]
            : datasets.debtLetters
            ? [
                { title: "REPORT", rows: datasets.report },
                { title: "DEBTORS", rows: datasets.residents },
                { title: "DEBT", rows: datasets.debt },
            ]
            : datasets.debt
            ? [
                { title: "REPORT", rows: datasets.report },
                { title: "BILLING", rows: datasets.apartments },
                { title: "DEBT", rows: datasets.debt },
                { title: "DEBTORS", rows: datasets.residents },
            ]
            : [
                { title: "REPORT", rows: datasets.report },
                { title: "COMPLEXES", rows: datasets.complexes },
                { title: "HOUSES", rows: datasets.houses },
                { title: "APARTMENTS", rows: datasets.apartments },
                { title: "RESIDENTS", rows: datasets.residents },
            ];
        const chunks = [];
        sections.forEach((section, index) => {
            chunks.push(`# ${exportLabel(section.title)}`);
            chunks.push(jsonToCsv(localizedRows(section.rows)));
            if (index < sections.length - 1) chunks.push("");
        });
        return `\uFEFF${chunks.join("\n")}`;
    };
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
        const isMaintenanceLog = lastExportContext === "maintenance" || source.toLowerCase().includes("maintenance log");
        const isUsageReport = lastExportContext === "usage-report" || source.toLowerCase().includes("usage report");
        syncExportFilters();
        document.querySelectorAll("[data-export-format] button").forEach((item) => item.classList.toggle("is-active", (item.dataset.format || "XLSX") === selectedExportFormat));
        exportModal?.querySelector("[data-export-subtitle]")?.replaceChildren(document.createTextNode(isMaintenanceLog
            ? "Backend maintenance export from Django admin data."
            : isUsageReport
            ? "Export real backend rows with custom scope and exact date range."
            : `Source: ${source}. Export uses real backend rows and selected filters.`));
        openOverlayById("export-preview-modal");
    };
    document.querySelectorAll("[data-export-format] button").forEach((button) => button.addEventListener("click", () => {
        const requestedFormat = button.dataset.format || "XLSX";
        selectedExportFormat = requestedFormat;
        document.querySelectorAll("[data-export-format] button").forEach((item) => item.classList.toggle("is-active", (item.dataset.format || "XLSX") === selectedExportFormat));
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
            maintenance_backend_ids: [],
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
            const maintenanceId = Number(detailsHost.dataset.maintenanceBackendId || 0);
            const alertId = Number(detailsHost.dataset.alertBackendId || 0);
            if (ownerId && !selection.owner_ids.length) selection.owner_ids = [ownerId];
            if (apartmentId && !selection.apartment_backend_ids.length) selection.apartment_backend_ids = [apartmentId];
            if (buildingId && !selection.building_backend_ids.length) selection.building_backend_ids = [buildingId];
            if (complexId && !selection.complex_backend_ids.length) selection.complex_backend_ids = [complexId];
            if (maintenanceId) selection.maintenance_backend_ids = [maintenanceId];
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
        if (context === "maintenance") {
            selection.maintenance_backend_ids = Array.from(document.querySelectorAll("[data-maintenance-id]:not(.hidden)"))
                .map((row) => Number(row.dataset.maintenanceId || row.dataset.backendId || 0))
                .filter(Boolean);
            return selection;
        }
        if (context === "residential") {
            const rows = Array.from(document.querySelectorAll("[data-drill-row]:not(.hidden)"));
            selection.complex_backend_ids = rows.filter((row) => row.dataset.backendType === "complex").map((row) => Number(row.dataset.backendId || 0)).filter(Boolean);
            selection.building_backend_ids = rows.filter((row) => row.dataset.backendType === "building").map((row) => Number(row.dataset.backendId || 0)).filter(Boolean);
            selection.apartment_backend_ids = rows.filter((row) => row.dataset.backendType === "apartment").map((row) => Number(row.dataset.backendId || 0)).filter(Boolean);
            return selection;
        }
        return selection;
    };
    document.querySelector("[data-export-download]")?.addEventListener("click", async () => {
        try {
            const effectiveContext = getEffectiveExportContext(lastExportContext || "default");
            const payload = await postPortalJson("/api/export/report/", {
                ...buildBackendExportSelection(effectiveContext),
                context: effectiveContext,
                format: selectedExportFormat,
                source: lastExportSource || "Current page",
                language: exportLang(),
            });
            triggerDownloadPayload(payload.download);
            rehydrateFromPortalData(payload.portalData);
            toast("Download ready", `${selectedExportFormat} file generated from backend data.`, "success");
        } catch (error) {
            toast("Export failed", error.message || "Backend export failed.", "warning");
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
        maintenance: [
            { value: "Scheduled", tone: "info", icon: "event_available", label: { en: "Scheduled", ru: "Запланировано", uz: "Rejalashtirilgan" }, note: { en: "Task is on the service calendar.", ru: "Задача в календаре обслуживания.", uz: "Vazifa xizmat jadvalida." } },
            { value: "In Progress", tone: "warning", icon: "engineering", label: { en: "In progress", ru: "В работе", uz: "Jarayonda" }, note: { en: "Technician is handling it.", ru: "Техник уже работает.", uz: "Texnik ishlamoqda." } },
            { value: "Completed", tone: "success", icon: "task_alt", label: { en: "Completed", ru: "Завершено", uz: "Bajarildi" }, note: { en: "Maintenance task is complete.", ru: "Задача обслуживания завершена.", uz: "Xizmat vazifasi bajarildi." } },
            { value: "Deferred", tone: "neutral", icon: "event_busy", label: { en: "Deferred", ru: "Отложено", uz: "Kechiktirildi" }, note: { en: "Move to a later window.", ru: "Перенести на позднее окно.", uz: "Keyinroq muddatga o'tkazish." } },
        ],
        default: [
            { value: "Operational", tone: "success", icon: "verified", label: { en: "Operational", ru: "Работает", uz: "Ishlayapti" }, note: { en: "Normal operating state.", ru: "Нормальное рабочее состояние.", uz: "Normal ish holati." } },
            { value: "Maintenance", tone: "warning", icon: "build", label: { en: "Maintenance", ru: "Обслуживание", uz: "Xizmat" }, note: { en: "Requires service attention.", ru: "Требует обслуживания.", uz: "Xizmat e'tibori kerak." } },
            { value: "Review", tone: "info", icon: "fact_check", label: { en: "Review", ru: "Проверка", uz: "Tekshiruv" }, note: { en: "Needs manual confirmation.", ru: "Нужно ручное подтверждение.", uz: "Qo'lda tasdiqlash kerak." } },
        ],
    };
    const statusTone = (status, forcedTone = "") => {
        if (forcedTone) return forcedTone;
        const value = String(status || "").toLowerCase();
        if (value.includes("failed") || value.includes("critical") || value.includes("ошибка") || value.includes("крит")) return "critical";
        if (value.includes("completed") || value.includes("operational") || value.includes("success") || value.includes("low risk") || value.includes("paid")) return "success";
        if (value.includes("maintenance") || value.includes("pending") || value.includes("medium") || value.includes("progress") || value.includes("scheduled")) return "warning";
        if (value.includes("review") || value.includes("upcoming")) return "info";
        return "neutral";
    };
    const renderAssignedStatus = (status, tone = "") => {
        const config = typeof status === "object" ? status : { value: status, tone };
        const label = config.label ? statusLabel(config.label) : String(config.value || "Pending").trim();
        const safe = label || String(config.value || "Pending").trim();
        const finalTone = statusTone(config.value || safe, config.tone || tone);
        return `<span class="table-assigned-status is-${finalTone}">${safe.toUpperCase()}</span>`;
    };
    const getRowsForStatusAction = (button) => {
        const workspace = button.closest(".table-tools")?.nextElementSibling;
        if (!workspace) return [];
        return Array.from(workspace.querySelectorAll("tbody tr")).filter((row) => !row.classList.contains("hidden"));
    };
    const getStatusRowKey = (row, context) => {
        if (row.dataset.districtId) return `${context}|district|${row.dataset.districtId}`.toLowerCase();
        if (row.dataset.buildingId) return `${context}|building|${row.dataset.buildingId}`.toLowerCase();
        if (row.dataset.parentBuilding) {
            const unit = row.querySelector("[data-apartment-details]")?.dataset.unit
                || row.querySelector("[data-apartment-details]")?.dataset.title
                || "";
            if (unit) return `${context}|apartment|${row.dataset.parentBuilding}|${unit}`.toLowerCase();
        }
        const cells = Array.from(row.querySelectorAll("td")).filter((cell) => !cell.querySelector("[data-row-select]"));
        const base = cells.slice(0, 3).map((cell) => {
            const clone = cell.cloneNode(true);
            clone.querySelectorAll(".risk-badge, .residential-risk-pill, .table-assigned-status, [data-row-select]").forEach((item) => item.remove());
            return clone.textContent.trim().replace(/\s+/g, " ");
        }).join("|");
        return `${context}|${base}`.toLowerCase();
    };
    const getLegacyStatusRowKey = (row, context) => {
        const cells = Array.from(row.querySelectorAll("td")).filter((cell) => !cell.querySelector("[data-row-select]"));
        const base = cells.slice(0, 3).map((cell) => cell.textContent.trim().replace(/\s+/g, " ")).join("|");
        return `${context}|${base}`.toLowerCase();
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
    const updateResidentialRiskBadge = (row, statusConfig, statusIndex = -1) => {
        const cells = Array.from(row.querySelectorAll("td")).filter((cell) => !cell.querySelector("[data-row-select]"));
        const targetCell = cells[statusIndex]
            || cells.find((cell) => cell.textContent.includes("UZS"))
            || cells[cells.length - 2]
            || cells[0];
        if (!targetCell) return;
        targetCell.querySelectorAll(".risk-badge, .residential-risk-pill, .table-assigned-status").forEach((item) => item.remove());
        const badge = document.createElement("span");
        badge.className = "residential-risk-pill";
        if (statusConfig.tone === "critical") badge.classList.add("is-critical");
        if (statusConfig.tone === "warning") badge.classList.add("is-medium");
        if (statusConfig.tone === "info") badge.classList.add("is-review");
        badge.dataset.i18nKey = statusConfig.value;
        badge.textContent = statusLabel(statusConfig.label);
        const amount = targetCell.querySelector("p");
        if (amount) amount.insertAdjacentElement("afterend", badge);
        else targetCell.appendChild(badge);
        row.dataset.assignedStatus = statusConfig.value;
    };
    const applyStatusToRow = (row, statusConfig, statusIndex = -1, context = "default") => {
        if (context === "residential") {
            updateResidentialRiskBadge(row, statusConfig, statusIndex);
            return;
        }
        const cells = Array.from(row.querySelectorAll("td")).filter((cell) => !cell.querySelector("[data-row-select]"));
        if (!cells.length) return;
        const fallbackIndex = cells.length >= 2 ? cells.length - 2 : 0;
        const statusCell = cells[statusIndex] || cells[fallbackIndex] || cells[0];
        statusCell.innerHTML = renderAssignedStatus(statusConfig);
        row.dataset.assignedStatus = statusConfig.value;
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
        if (context === "maintenance") {
            const targetId = Number(row.dataset.maintenanceId || row.dataset.backendId || 0);
            return targetId ? { target_type: "maintenance", target_id: targetId } : null;
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
            maintenance: "System Maintenance Log",
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
                state.innerHTML = '<span class="material-symbols-outlined">search_off</span><strong>No transactions for selected filters</strong><small>Try another search term or reset filters. Backend data will refresh on retry.</small><button type="button" data-table-empty-reset>Retry</button>';
                host.appendChild(state);
            }
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
        const searches = JSON.parse(storage.getItem("hydroflow-recent-searches") || "[]").filter((item) => item !== input.value.trim());
        if (input.value.trim()) {
            searches.unshift(input.value.trim());
            storage.setItem("hydroflow-recent-searches", JSON.stringify(searches.slice(0, 5)));
        }
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
    document.querySelector("[data-clear-read]")?.addEventListener("click", () => {
        document.querySelectorAll("[data-notification-list] .notification-item[data-read='true']").forEach((item) => {
            if (item.dataset.pinned !== "true") item.remove();
        });
        updateNotifications();
        toast("Read notifications cleared", "Pinned items stay visible.", "info");
    });

    const renderBackendAuditEvents = () => {
        const timeline = document.querySelector("[data-audit-timeline]");
        const events = Array.isArray(billingData.auditEvents) ? billingData.auditEvents : [];
        if (!timeline) return;
        if (timeline.dataset.serverList === "audit") return;
        if (!events.length && !billingData.source) return;
        const iconForType = (type) => ({
            export: "ios_share",
            reminder: "notifications_active",
            alert: "warning",
            balance: "account_balance_wallet",
            note: "edit_note",
            status: "sell",
            system: "settings_suggest",
        }[type] || "history");
        timeline.innerHTML = events.map((event) => `
            <div class="audit-event" data-audit-event data-type="${escapeHtml(event.type || "system")}">
                <span class="audit-event-icon material-symbols-outlined">${escapeHtml(iconForType(event.type))}</span>
                <div>
                    <time>${escapeHtml(event.time || "")}</time>
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

    const clickLogsStorageKey = "hydroflow-click-logs";
    const maxClickLogs = 400;

    const readClickLogs = () => {
        try {
            const parsed = JSON.parse(storage.getItem(clickLogsStorageKey) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const writeClickLogs = (logs) => {
        storage.setItem(clickLogsStorageKey, JSON.stringify(Array.isArray(logs) ? logs.slice(0, maxClickLogs) : []));
    };

    const getClickTargetLabel = (element) => {
        if (!element) return "Unknown";
        const explicit = element.dataset.actionKey
            || element.dataset.i18nKey
            || element.getAttribute("aria-label")
            || element.title
            || element.textContent;
        return (explicit || "Unknown").replace(/\s+/g, " ").trim().slice(0, 160);
    };

    const getClickTargetScope = (element) => {
        if (!element) return "page";
        if (element.closest(".account-menu")) return "account-menu";
        if (element.closest(".app-modal")) return "modal";
        if (element.closest(".app-drawer")) return "drawer";
        if (element.closest("aside")) return "sidebar";
        if (element.closest("header")) return "topbar";
        if (element.closest("main")) return "main";
        return "page";
    };

    const pushClickLog = (element) => {
        const logs = readClickLogs();
        const now = new Date();
        logs.unshift({
            id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
            at: now.toISOString(),
            path: `${window.location.pathname}${window.location.search || ""}`,
            scope: getClickTargetScope(element),
            label: getClickTargetLabel(element),
        });
        writeClickLogs(logs);
    };

    const renderClickLogs = () => {
        const drawer = document.getElementById("click-logs-drawer");
        if (!drawer) return;
        const list = drawer.querySelector("[data-click-logs-list]");
        const empty = drawer.querySelector("[data-click-logs-empty]");
        const total = drawer.querySelector("[data-click-logs-total]");
        const visible = drawer.querySelector("[data-click-logs-visible]");
        const search = drawer.querySelector("[data-click-logs-search]");
        if (!list || !empty) return;

        const query = (search?.value || "").trim().toLowerCase();
        const allLogs = readClickLogs();
        const filtered = query
            ? allLogs.filter((item) => `${item.label} ${item.path} ${item.scope}`.toLowerCase().includes(query))
            : allLogs;

        list.innerHTML = filtered.map((item) => {
            const dt = new Date(item.at);
            const dateText = Number.isNaN(dt.getTime()) ? item.at : dt.toLocaleString();
            return `
                <div class="audit-event" data-type="action">
                    <span class="audit-event-icon material-symbols-outlined">touch_app</span>
                    <div>
                        <time>${escapeHtml(dateText)}</time>
                        <p>${escapeHtml(item.label || "Action")}</p>
                        <span>${escapeHtml(item.path || "/")} · ${escapeHtml(item.scope || "page")}</span>
                    </div>
                </div>
            `;
        }).join("");

        if (total) total.textContent = String(allLogs.length);
        if (visible) visible.textContent = String(filtered.length);
        empty.classList.toggle("hidden", filtered.length > 0);
    };

    const setupClickLogsDrawer = () => {
        const drawer = document.getElementById("click-logs-drawer");
        if (!drawer || drawer.dataset.clickLogsReady === "true") return;
        drawer.dataset.clickLogsReady = "true";
        const search = drawer.querySelector("[data-click-logs-search]");
        search?.addEventListener("input", renderClickLogs);
        drawer.querySelector("[data-click-logs-action='clear']")?.addEventListener("click", () => {
            writeClickLogs([]);
            renderClickLogs();
            toast("Logs cleared", "Action history was cleared in this browser.", "info");
        });
        renderClickLogs();
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
        let activeType = "all";

        const getEvents = () => Array.from(drawer.querySelectorAll("[data-audit-event]"));
        const refreshAudit = () => {
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

        filters.forEach((button) => button.addEventListener("click", () => {
            activeType = button.dataset.auditFilter || "all";
            filters.forEach((item) => item.classList.toggle("is-active", item === button));
            refreshAudit();
        }));
        search?.addEventListener("input", refreshAudit);

        drawer.querySelector("[data-audit-action='add-note']")?.addEventListener("click", async () => {
            try {
                const payload = await postPortalJson("/api/audit/note/", {
                    title: "Audit note",
                    message: "Manual audit note added from audit drawer.",
                });
                rehydrateFromPortalData(payload.portalData);
                activeType = "all";
                filters.forEach((filter) => filter.classList.toggle("is-active", filter.dataset.auditFilter === "all"));
                refreshAudit();
                toast("Audit note added", "Stored in backend audit trail.", "success");
            } catch (error) {
                toast("Audit note save failed", error.message || "Backend audit note was not saved.", "danger");
            }
        });

        drawer.querySelector("[data-audit-action='copy-latest']")?.addEventListener("click", async () => {
            const latest = getEvents().find((event) => !event.classList.contains("hidden")) || getEvents()[0];
            const text = latest?.textContent.trim().replace(/\s+/g, " ") || "No audit events";
            try {
                await navigator.clipboard?.writeText(text);
                toast("Latest audit event copied", text, "success");
            } catch {
                toast("Latest audit event ready", text, "info");
            }
        });

        drawer.querySelector("[data-audit-action='export']")?.addEventListener("click", () => {
            const rows = getEvents().map((event) => {
                const time = event.querySelector("time")?.textContent.trim() || "";
                const message = event.querySelector("p")?.textContent.trim() || "";
                const type = event.dataset.type || "";
                return `"${time}","${type}","${message.replace(/"/g, '""')}"`;
            });
            const blob = new Blob([["Time,Type,Message", ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "hydroflow-audit-log.csv";
            link.click();
            URL.revokeObjectURL(link.href);
            toast("Audit log exported", "Backend audit CSV was generated from the current timeline.", "success");
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
    setupAuditTools();
    setupClickLogsDrawer();
    setupSupportTools();
    setupBillingNoticeQuickAction();
    setupBillingPeriodQuickAction();
    window.HydroFlowRenderSupport = renderSupportDrawer;

    document.addEventListener("click", (event) => {
        const button = event.target.closest("button, a, [role='button']");
        if (!button) return;
        if (
            button.closest("#click-logs-drawer")
            || button.matches("[data-close-overlay], [data-click-logs-action='clear']")
        ) {
            return;
        }
        pushClickLog(button);
        if (document.getElementById("click-logs-drawer")?.classList.contains("is-open")) {
            renderClickLogs();
        }
    }, true);

    document.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        if (
            button.matches("[data-resident-kit-action], [data-system-alert-link], [data-maintenance-widget-item], [data-maintenance-action]")
            || button.closest("[data-resident-kit-action], [data-system-alert-link], [data-maintenance-widget-item], [data-maintenance-action]")
        ) {
            return;
        }
        const actionKey = button.dataset.actionKey || button.dataset.i18nKey || button.textContent.trim();
        const label = actionKey.toLowerCase();
        const lang = storage.getItem("hydroflow-lang") || "en";
        if (label === "export") toast(translateValue("Export started", lang), "A static report preview is being prepared.");
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
        if (label.includes("sign out")) {
            event.preventDefault();
            postPortalJson("/api/logout/", {})
                .then((payload) => {
                    window.location.assign(payload.redirectUrl || "/");
                })
                .catch((error) => {
                    toast("Authentication request failed", error.message || "Logout request failed.", "warning");
                });
        }
    });
})();

