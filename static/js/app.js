(() => {
    const root = document.documentElement;
    const storage = window.localStorage;
    const languageOrder = ["en", "ru", "uz"];
    const translations = {
        "Utility Management": { ru: "Управление коммунальными услугами", uz: "Kommunal boshqaruv" },
        "Dashboard": { ru: "Обзор", uz: "Boshqaruv paneli" },
        "Residential Units": { ru: "Жилые объекты", uz: "Turar joy obyektlari" },
        "System Health": { ru: "Состояние систем", uz: "Tizim holati" },
        "Billing & Debt": { ru: "Платежи и долги", uz: "To'lovlar va qarzlar" },
        "Analytics": { ru: "Аналитика", uz: "Tahlil" },
        "New Unit Request": { ru: "Новая заявка", uz: "Yangi ariza" },
        "Settings": { ru: "Настройки", uz: "Sozlamalar" },
        "Support": { ru: "Поддержка", uz: "Yordam" },
        "Admin User": { ru: "Администратор", uz: "Administrator" },
        "Administrator": { ru: "Администратор", uz: "Administrator" },
        "Profile": { ru: "Профиль", uz: "Profil" },
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
        "District": { ru: "Район", uz: "Hudud" },
        "Status": { ru: "Статус", uz: "Holat" },
        "Period": { ru: "Период", uz: "Davr" },
        "Selected filters": { ru: "Выбранные фильтры", uz: "Tanlangan filtrlar" },
        "Reset filters": { ru: "Сбросить", uz: "Tozalash" },
        "Apply filters": { ru: "Применить", uz: "Qo'llash" },
        "North Sector": { ru: "Северный сектор", uz: "Shimoliy sektor" },
        "Harbor District": { ru: "Портовый район", uz: "Harbor tumani" },
        "South Ridge": { ru: "Южный хребет", uz: "Janubiy Ridge" },
        "All statuses": { ru: "Все статусы", uz: "Barcha holatlar" },
        "Maintenance": { ru: "Обслуживание", uz: "Texnik xizmat" },
        "Operational": { ru: "Работает", uz: "Ishlamoqda" },
        "Last 90 days": { ru: "Последние 90 дней", uz: "So'nggi 90 kun" },
        "Last 30 days": { ru: "Последние 30 дней", uz: "So'nggi 30 kun" },
        "Last 30 Days": { ru: "Последние 30 дней", uz: "So'nggi 30 kun" },
        "Current month": { ru: "Текущий месяц", uz: "Joriy oy" },
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
        "Total Complexes": { ru: "Всего комплексов", uz: "Jami komplekslar" },
        "Active Buildings": { ru: "Активные здания", uz: "Faol binolar" },
        "Occupancy Rate": { ru: "Заполняемость", uz: "Bandlik darajasi" },
        "Critical Debt Units": { ru: "Критичные должники", uz: "Jiddiy qarzdor obyektlar" },
        "Active Subscribers": { ru: "Активные абоненты", uz: "Faol abonentlar" },
        "new this month": { ru: "новых за месяц", uz: "bu oy yangi" },
        "Consumption Rate": { ru: "Потребление", uz: "Iste'mol darajasi" },
        "Efficient flow across 8 complexes": { ru: "Стабильный поток по 8 комплексам", uz: "8 kompleks bo'ylab barqaror oqim" },
        "Outstanding Debt": { ru: "Текущая задолженность", uz: "Joriy qarzdorlik" },
        "Requires Action": { ru: "Требует действия", uz: "Amal talab qiladi" },
        "Consumption Trends": { ru: "Динамика потребления", uz: "Iste'mol dinamikasi" },
        "Seasonal water vs. heating throughput (FY24)": { ru: "Сезонная динамика воды и отопления (FY24)", uz: "Suv va isitish bo'yicha mavsumiy o'tkazuvchanlik (FY24)" },
        "Water": { ru: "Вода", uz: "Suv" },
        "Heating": { ru: "Отопление", uz: "Isitish" },
        "Complex Status Health Scores": { ru: "Индекс состояния комплексов", uz: "Komplekslar holati indeksi" },
        "Optimal": { ru: "Оптимально", uz: "Optimal" },
        "Leak Alert": { ru: "Утечка", uz: "Oqish signali" },
        "Central District": { ru: "Центральный район", uz: "Markaziy tuman" },
        "Maintenance Pending": { ru: "Ожидает обслуживания", uz: "Xizmat kutilmoqda" },
        "Critical Alert": { ru: "Критичное уведомление", uz: "Jiddiy ogohlantirish" },
        "Quick Actions": { ru: "Быстрые действия", uz: "Tezkor amallar" },
        "Generate Usage Report": { ru: "Сформировать отчёт потребления", uz: "Iste'mol hisobotini yaratish" },
        "Add New Resident Profile": { ru: "Добавить профиль жильца", uz: "Yangi yashovchi profilini qo'shish" },
        "Configure System Alerts": { ru: "Настроить системные уведомления", uz: "Tizim ogohlantirishlarini sozlash" },
        "Debtor Trends": { ru: "Динамика должников", uz: "Qarzdorlar dinamikasi" },
        "High Risk": { ru: "Высокий риск", uz: "Yuqori xavf" },
        "Critical Debtors (Top 3 Δ)": { ru: "Критичные должники (топ 3 Δ)", uz: "Jiddiy qarzdorlar (top 3 Δ)" },
        "Generate Debt Letters": { ru: "Сформировать письма по долгам", uz: "Qarz xatlarini yaratish" },
        "View All Debtors": { ru: "Все должники", uz: "Barcha qarzdorlar" },
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
        "Credit": { ru: "Кредит", uz: "Kredit" },
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
        "Residential Complex Management": { ru: "Управление жилым комплексом", uz: "Turar joy kompleksini boshqarish" },
        "Managing 124 active residents across 48 units.": { ru: "124 активных жильца в 48 объектах.", uz: "48 obyekt bo'yicha 124 faol yashovchi." },
        "Add New Resident": { ru: "Добавить жильца", uz: "Yangi yashovchi qo'shish" },
        "Consumption & Collections Overview": { ru: "Потребление и сборы", uz: "Iste'mol va tushumlar sharhi" },
        "Active Debtors": { ru: "Активные должники", uz: "Faol qarzdorlar" },
        "Total Outstanding": { ru: "Общая задолженность", uz: "Jami qarzdorlik" },
        "Collection Rate": { ru: "Уровень сборов", uz: "Yig'im darajasi" },
        "Total Complex Usage": { ru: "Общее потребление комплекса", uz: "Kompleks bo'yicha jami iste'mol" },
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
        "Resident": { ru: "Жилец", uz: "Yashovchi" },
        "Type": { ru: "Тип", uz: "Turi" },
        "Date": { ru: "Дата", uz: "Sana" },
        "Amount (UZS)": { ru: "Сумма (UZS)", uz: "Miqdor (UZS)" },
        "Action": { ru: "Действие", uz: "Amal" },
        "Success": { ru: "Успешно", uz: "Muvaffaqiyatli" },
        "Utility Payment": { ru: "Коммунальный платёж", uz: "Kommunal to'lov" },
        "Usage Payment": { ru: "Оплата потребления", uz: "Iste'mol to'lovi" },
        "Export CSV": { ru: "Экспорт CSV", uz: "CSV eksport" },
        "Complex Performance Overview": { ru: "Обзор эффективности комплексов", uz: "Komplekslar samaradorligi sharhi" },
        "Complex Name": { ru: "Название комплекса", uz: "Kompleks nomi" },
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
        "Residential complex detail preview.": { ru: "Демо-детали жилого комплекса.", uz: "Turar joy kompleksi tafsilotlari." },
        "Heating maintenance window pending": { ru: "Ожидается окно обслуживания отопления", uz: "Isitish xizmati oynasi kutilmoqda" },
        "Schedule technician assignment before 15 Apr 2026.": { ru: "Назначьте техника до 15 Apr 2026.", uz: "Texnikni 15 Apr 2026 gacha tayinlang." },
        "Balance report exported by Admin User.": { ru: "Администратор экспортировал отчёт баланса.", uz: "Administrator balans hisobotini eksport qildi." },
        "Reminder queued for overdue residents.": { ru: "Напоминание для должников поставлено в очередь.", uz: "Qarzdor yashovchilar uchun eslatma navbatga qo'yildi." },
        "Alert review completed after technician confirmation.": { ru: "Проверка alert завершена после подтверждения техника.", uz: "Texnik tasdig'idan keyin alert tekshiruvi yakunlandi." },
        "Admin User exported billing report for North Sector.": { ru: "Администратор экспортировал биллинговый отчёт Северного сектора.", uz: "Administrator Shimoliy sektor billing hisobotini eksport qildi." },
        "Debt reminder sent to Harbor View Heights.": { ru: "Напоминание о долге отправлено в Harbor View Heights.", uz: "Harbor View Heights uchun qarz eslatmasi yuborildi." },
        "Pressure alert closed after technician confirmation.": { ru: "Alert давления закрыт после подтверждения техника.", uz: "Bosim alerti texnik tasdig'idan keyin yopildi." },
        "Balance adjustment queued for Residential Unit 402B.": { ru: "Корректировка баланса для объекта 402B поставлена в очередь.", uz: "402B obyekt balansi tuzatishi navbatga qo'yildi." },
        "Open complex details": { ru: "Открыть детали комплекса", uz: "Kompleks tafsilotlarini ochish" },
        "Open details": { ru: "Открыть детали", uz: "Tafsilotlarni ochish" },
        "Open filters": { ru: "Открыть фильтры", uz: "Filtrlarni ochish" },
        "Review notifications": { ru: "Проверить уведомления", uz: "Bildirishnomalarni ko'rish" },
        "Open audit log": { ru: "Открыть журнал аудита", uz: "Audit jurnalini ochish" },
        "Workspace Settings": { ru: "Настройки рабочего пространства", uz: "Ish maydoni sozlamalari" },
        "Quick preferences for the operations console.": { ru: "Быстрые настройки рабочей консоли.", uz: "Operatsion konsol uchun tezkor sozlamalar." },
        "Settings sync is offline": { ru: "Синхронизация настроек недоступна", uz: "Sozlamalar sinxronlash oflayn" },
        "Local changes remain available and will retry on reconnect.": { ru: "Локальные изменения сохранятся и повторятся после подключения.", uz: "Mahalliy o'zgarishlar saqlanadi va ulanish tiklanganda qayta urinadi." },
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
        "Capture the request first. Details can be assigned after validation.": { ru: "Сначала зафиксируйте заявку. Детали можно назначить после проверки.", uz: "Avval arizani kiriting. Tafsilotlar tekshiruvdan keyin belgilanadi." },
        "Create request": { ru: "Создать заявку", uz: "Ariza yaratish" },
        "Cancel": { ru: "Отмена", uz: "Bekor qilish" },
        "Export started": { ru: "Экспорт запущен", uz: "Eksport boshlandi" },
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
        "Export template": { ru: "Экспорт шаблона", uz: "Shablonni eksport qilish" },
        "Resident Operations Kit": { ru: "Операционный набор жильцов", uz: "Rezidentlar operatsion to'plami" },
        "Templates ready": { ru: "Шаблоны готовы", uz: "Shablonlar tayyor" },
        "Quick static templates for handoff, reminders and move-in checks.": { ru: "Статичные шаблоны для передачи, напоминаний и заселения.", uz: "Topshirish, eslatmalar va ko'chib kirish tekshiruvlari uchun statik shablonlar." },
        "Move-in checklist": { ru: "Чеклист заселения", uz: "Ko'chib kirish ro'yxati" },
        "Reminder script": { ru: "Скрипт напоминания", uz: "Eslatma skripti" },
        "Contact sheet": { ru: "Лист контактов", uz: "Kontakt varaqasi" },
        "Checklist opened": { ru: "Чеклист открыт", uz: "Ro'yxat ochildi" },
        "Complex": { ru: "Комплекс", uz: "Kompleks" },
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
        "Search inside table...": { ru: "Поиск в таблице...", uz: "Jadvaldan qidirish..." },
        "Search residents...": { ru: "Поиск жильцов...", uz: "Yashovchilarni qidirish..." },
        "Search district, house, apartment, resident...": { ru: "Поиск района, дома, квартиры, жильца...", uz: "Hudud, uy, xonadon, yashovchi..." },
        "Search residents, reports, alerts, actions...": { ru: "Поиск жителей, отчетов, уведомлений, действий...", uz: "Rezidentlar, hisobotlar, xabarlar, amallar..." },
        "Resident name": { ru: "Имя жильца", uz: "Yashovchi ismi" },
        "Unit identifier": { ru: "Номер объекта", uz: "Obyekt raqami" },
    };

    const translatableTextNodes = new Map();
    const normalizeText = (value) => value.replace(/\s+/g, " ").trim();
    const translateValue = (key, lang) => {
        if (lang === "en") return key;
        return translations[key]?.[lang] || key;
    };

    const captureTranslatableNodes = () => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.parentElement) return NodeFilter.FILTER_REJECT;
                if (["SCRIPT", "STYLE", "TEXTAREA"].includes(node.parentElement.tagName)) return NodeFilter.FILTER_REJECT;
                const key = normalizeText(node.nodeValue);
                return translations[key] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            },
        });
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const key = normalizeText(node.nodeValue);
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
    };

    const getResidentById = (id) => billingData.residents.find((resident) => resident.id === id);
    const getComplexById = (id) => billingData.complexes.find((complex) => complex.id === id);
    const getResidentTransactions = (residentId) => billingData.transactions.filter((transaction) => transaction.residentId === residentId);
    const dateValue = (date) => {
        const [day, month, year] = String(date || "").split(".").map(Number);
        return new Date(year || 1970, (month || 1) - 1, day || 1).getTime();
    };
    const riskForHealth = (health) => health < 86 ? "Critical" : health < 94 ? "Medium Risk" : "Low Risk";
    const toneForRisk = (risk) => risk === "Critical" ? "red" : risk === "Medium Risk" ? "amber" : "blue";
    const getComplexStats = () => billingData.complexes.map((complex) => {
        const residents = billingData.residents.filter((resident) => resident.complexId === complex.id);
        const transactions = billingData.transactions.filter((transaction) => transaction.complexId === complex.id);
        const paidResidents = residents.filter((resident) => resident.status === "paid").length;
        const debtorResidents = residents.filter((resident) => resident.status === "debtor").length;
        const residentDebt = residents.reduce((total, resident) => total + (resident.balance < 0 ? Math.abs(resident.balance) : 0), 0);
        const collected = complex.baselineCollected + transactions
            .filter((transaction) => transaction.status === "Success")
            .reduce((total, transaction) => total + transaction.amount, 0);
        const debt = complex.extraDebt + residentDebt;
        const health = complex.health;
        const risk = riskForHealth(health);
        const issueEvery = risk === "Critical" ? 3 : risk === "Medium Risk" ? 4 : 0;
        return {
            ...complex,
            residents,
            transactions,
            paidResidents: Math.max(complex.units - Math.max(debtorResidents, Math.round(complex.units * ((100 - health) / 100))), paidResidents),
            debtorResidents: Math.max(debtorResidents, Math.round(complex.units * ((100 - health) / 100))),
            collected,
            debt,
            finances: collected + debt,
            health,
            risk,
            tone: toneForRisk(risk),
            issueEvery,
        };
    });
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
        const activeAlerts = billingData.complexes.filter((complex) => complex.water !== "Optimal" || complex.heating !== "Optimal").length;
        const criticalDebtUnits = criticalComplexes.reduce((total, complex) => total + complex.debtorResidents, 0);
        const totalDebtorUnits = complexes.reduce((total, complex) => total + complex.debtorResidents, 0);
        const totalPaidUnits = complexes.reduce((total, complex) => total + complex.paidResidents, 0);
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
            criticalAlerts: criticalComplexes.length,
            criticalDebtUnits,
            totalDebtorUnits,
            totalPaidUnits,
            avgPressure,
            detailedResidents: billingData.residents.length,
            detailedDebtors: billingData.residents.filter((resident) => resident.status === "debtor").length,
            pendingTransactions: billingData.transactions.filter((transaction) => transaction.status !== "Success").length,
            successfulTransactions: billingData.transactions.filter((transaction) => transaction.status === "Success").length,
            sectors: new Set(billingData.complexes.map((complex) => complex.sector)).size,
        };
    };

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
        if (options.sound !== false) playSound(kind === "danger" ? "critical" : "toast");
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

    const applyDensity = (density) => {
        const safeDensity = density === "compact" ? "compact" : "comfortable";
        root.dataset.density = safeDensity;
        document.querySelectorAll("[data-density]").forEach((button) => {
            button.classList.toggle("is-active", button.dataset.density === safeDensity);
        });
        storage.setItem("hydroflow-density", safeDensity);
    };

    applyDensity(storage.getItem("hydroflow-density") || "comfortable");

    document.querySelectorAll("[data-density]").forEach((button) => button.addEventListener("click", () => {
        const previousDensity = root.dataset.density || "comfortable";
        if (button.dataset.density === previousDensity) return;
        applyDensity(button.dataset.density);
        const lang = storage.getItem("hydroflow-lang") || "en";
        toast(translateValue("Density updated", lang), button.dataset.density === "compact" ? "Compact density enabled." : "Comfortable density enabled.");
    }));

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => button.addEventListener("click", () => {
        const next = root.classList.contains("dark") ? "light" : "dark";
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
            payments: payments.length ? payments : [{ method: "No payments", amount: "0 UZS", date: resident.lastPayment || "13.04.2026" }],
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
        if (button.dataset.confirmAction === "close-critical-alert") playSound("critical");
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
        document.querySelector("[data-notification-dot]")?.classList.toggle("hidden", unread === 0);
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
            const host = cardFor(label);
            const valueElement = valueNode(host, label);
            if (valueElement) {
                valueElement.dataset.statSynced = "true";
                valueElement.textContent = value;
            }
            if (support) {
                const supportElement = supportNode(host, valueElement);
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

        setStat("Total Revenue", formatCompactUzs(stats.totalCollected), `${formatCompactUzs(stats.transactionVolume)} logged locally`);
        setStat("Active Subscribers", moneyFormatter.format(stats.occupiedUnits), `${stats.detailedResidents} linked resident profiles`);
        setStat("Consumption Rate", `${compactNumber(stats.totalUsageM3)} m³`, `Across ${stats.totalComplexes} complexes`);
        setStat("Outstanding Debt", formatCompactUzs(stats.totalDebt), `${stats.criticalDebtUnits} critical units`);
        setStat("Total Complexes", moneyFormatter.format(stats.totalComplexes), `${stats.sectors} sectors connected`);
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
            if (button.dataset.networkFilter === "all") strong.textContent = stats.totalBuildings;
            if (button.dataset.networkFilter === "online") strong.textContent = Math.max(0, stats.totalBuildings - stats.activeAlerts);
            if (button.dataset.networkFilter === "issue") strong.textContent = stats.activeAlerts;
        });

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
            healthList.innerHTML = stats.complexes.slice(0, 3).map((complex) => `
                <div class="flex items-center justify-between p-4 bg-surface-container rounded-lg">
                    <div class="flex items-center gap-4">
                        <div class="p-2 bg-white rounded-md shadow-sm text-primary">
                            <span class="material-symbols-outlined" data-icon="${complex.icon || "apartment"}">${complex.icon || "apartment"}</span>
                        </div>
                        <div>
                            <p class="font-bold text-sm">${escapeHtml(complex.name)}</p>
                            <p class="text-xs text-on-surface-variant">${complex.units} Units · ${escapeHtml(complex.sector)}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="percent-meter percent-meter-${escapeHtml(complex.tone)} percent-meter-mini ml-auto" style="--progress: ${complex.health}%;" data-value="${complex.health}%">
                            <span class="percent-meter-track"><span class="percent-meter-fill"></span></span>
                        </div>
                        <p class="text-[10px] text-on-surface-variant uppercase" data-i18n-key="${escapeHtml(complex.risk)}">${escapeHtml(complex.risk)}</p>
                    </div>
                </div>
            `).join("");
        }

        const debtorList = document.querySelector(".debtor-list .space-y-2");
        if (debtorList) {
            debtorList.innerHTML = stats.complexes.slice()
                .sort((a, b) => b.debt - a.debt)
                .slice(0, 3)
                .map((complex) => {
                    const share = (complex.debt / Math.max(stats.totalDebt, 1)) * 100;
                    return `
                        <div class="debtor-row flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/5">
                            <span class="text-xs font-semibold">${escapeHtml(complex.name)}</span>
                            <div class="percent-meter percent-meter-red percent-meter-row" style="--progress: ${Math.min(100, share)}%;" data-value="${percentValue(share)}">
                                <span class="percent-meter-track"><span class="percent-meter-fill"></span></span>
                            </div>
                        </div>
                    `;
                }).join("");
        }

        const trendBars = document.querySelectorAll(".debtor-trend-chart .debtor-trend-bar");
        if (trendBars.length) {
            const factors = [0.72, 0.78, 0.83, 0.88, 0.94, 1];
            trendBars.forEach((bar, index) => {
                const value = stats.totalDebt * (factors[index] || 1);
                const height = Math.max(34, Math.round((value / stats.totalDebt) * 100));
                bar.style.height = `${height}%`;
                bar.dataset.value = formatCompactUzs(value);
                const tooltip = bar.querySelector(".debtor-trend-tooltip");
                if (tooltip) tooltip.textContent = formatBillingUzs(value);
            });
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
                ? `<button class="w-full py-2 bg-error text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors" type="button" data-i18n-key="SEND URGENT REMINDER">SEND URGENT REMINDER</button>`
                : `<button class="w-full py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors" data-resident-billing-history type="button" data-i18n-key="VIEW BILLING HISTORY">VIEW BILLING HISTORY</button>`;
            return `
                <div class="resident-card group ${isDebtor ? "bg-error-container/30 border-error/20" : "bg-secondary-container/20 border-secondary/10"} border p-5 rounded-xl transition-all hover:shadow-lg relative overflow-hidden"
                    data-resident-card data-resident-id="${escapeHtml(resident.id)}" data-complex-id="${escapeHtml(resident.complexId)}" data-resident-status="${escapeHtml(resident.status)}">
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
        if (residentGrid) {
            residentGrid.innerHTML = billingData.residents.map(renderResidentCard).join("");
        }

        const repairEnhancedTableControls = (table) => {
            if (!table || table.dataset.billingControlsReady === "true") return;
            const body = table.querySelector("tbody");
            const workspace = table.closest(".table-workspace") || table.closest(".overflow-x-auto") || table;
            const tools = workspace.previousElementSibling?.classList?.contains("table-tools") ? workspace.previousElementSibling : null;
            const pagination = workspace.nextElementSibling?.classList?.contains("table-pagination") ? workspace.nextElementSibling : null;
            const selectAll = table.querySelector("[data-select-all]");
            const search = tools?.querySelector(".table-search");
            if (!body || !tools) return;
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
                filteredRows = rows.filter((row) => !query || row.textContent.toLowerCase().includes(query));
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
            pagination?.querySelector("[data-prev-page]")?.addEventListener("click", () => {
                page = Math.max(1, page - 1);
                updateVisibleRows();
            });
            pagination?.querySelector("[data-next-page]")?.addEventListener("click", () => {
                page += 1;
                updateVisibleRows();
            });
            updateVisibleRows();
        };

        const recentHeading = findHeading("Recent Transaction Log");
        const recentTable = recentHeading?.closest(".bg-surface-container-lowest")?.querySelector("table");
        const recentTableBody = recentTable?.querySelector("tbody");
        if (recentTableBody) {
            const headers = Array.from(recentTable.querySelectorAll("thead th"))
                .filter((cell) => !cell.querySelector("[data-select-all]"))
                .map((cell) => cell.textContent.trim().toLowerCase());
            const hasSelect = Boolean(recentTable.querySelector("[data-select-all]"));
            const usesAnalyticsColumns = headers.some((label) => label.includes("transaction id") || label.includes("provider") || label.includes("payer"));
            const selectCell = (label) => hasSelect ? `<td class="px-4 py-4"><input aria-label="${escapeHtml(label)}" data-row-select type="checkbox"></td>` : "";
            const statusBadge = (status) => `<span class="px-2 py-1 ${statusPillClass(status)} text-[10px] font-black uppercase rounded-full" data-i18n-key="${escapeHtml(status)}">${escapeHtml(status)}</span>`;
            const rows = billingData.transactions.slice()
                .sort((a, b) => dateValue(b.date) - dateValue(a.date))
                .map((transaction) => {
                    const resident = getResidentById(transaction.residentId);
                    const isPending = transaction.status !== "Success";
                    if (usesAnalyticsColumns) {
                        return `
                            <tr class="border-b border-surface-container-low hover:bg-surface-container-low/50 transition-colors" data-transaction-id="${escapeHtml(transaction.id)}" data-resident-id="${escapeHtml(transaction.residentId)}" data-complex-id="${escapeHtml(transaction.complexId)}">
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
                        <tr class="hover:bg-surface-container-low transition-colors" data-transaction-id="${escapeHtml(transaction.id)}" data-resident-id="${escapeHtml(transaction.residentId)}" data-complex-id="${escapeHtml(transaction.complexId)}">
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

        const revenueList = document.querySelector(".revenue-debt-card .space-y-5");
        if (revenueList) {
            revenueList.innerHTML = getComplexStats()
                .slice()
                .sort((a, b) => b.finances - a.finances)
                .slice(0, 5)
                .map((complex) => {
                    const remainder = Math.max(0, 100 - complex.health);
                    return `
                        <div class="revenue-debt-item space-y-2" data-complex-id="${escapeHtml(complex.id)}">
                            <div class="flex justify-between items-center text-xs font-bold">
                                <span class="text-on-surface">${escapeHtml(complex.name)}</span>
                                <span class="text-on-surface-variant">${complex.health}% Healthy</span>
                            </div>
                            <div class="percent-meter percent-meter-${escapeHtml(complex.tone)}" style="--progress: ${complex.health}%; --remainder: ${remainder}%;" data-value="${complex.health}%">
                                <span class="percent-meter-track"><span class="percent-meter-fill"></span><span class="percent-meter-remainder"></span></span>
                            </div>
                        </div>
                    `;
                }).join("");
        }

        const performanceHeading = findHeading("Complex Performance Overview");
        const performanceTable = performanceHeading?.closest(".bg-surface-container-lowest")?.querySelector("table");
        const performanceBody = performanceTable?.querySelector("tbody");
        if (performanceBody) {
            const hasSelect = Boolean(performanceTable.querySelector("[data-select-all]"));
            const selectCell = (label) => hasSelect ? `<td class="px-4 py-5"><input aria-label="${escapeHtml(label)}" type="checkbox"></td>` : "";
            const iconMarkup = (complex) => complex.image
                ? `<div class="w-10 h-10 rounded-lg overflow-hidden shrink-0"><img class="w-full h-full object-cover" src="${escapeHtml(complex.image)}" alt=""></div>`
                : `<div class="w-10 h-10 rounded-lg overflow-hidden shrink-0 text-primary-container bg-surface-container-high flex items-center justify-center"><span class="material-symbols-outlined" style="font-size: 20px;">${escapeHtml(complex.icon || "domain")}</span></div>`;
            const debtSplitTone = (debtors, paid) => {
                const ratio = paid ? debtors / paid : Infinity;
                if (ratio > 1) return "is-danger";
                if (ratio >= 0.75) return "is-caution";
                return "is-healthy";
            };
            performanceBody.innerHTML = getComplexStats().map((complex) => {
                const waterIssue = complex.water !== "Optimal";
                const heatingIssue = complex.heating !== "Optimal";
                const riskTextClass = complex.risk === "Critical" ? "text-error" : "text-on-surface";
                const splitTone = debtSplitTone(complex.debtorResidents, complex.paidResidents);
                return `
                    <tr aria-expanded="false" class="hover:bg-surface-container-low/30 transition-colors residential-district-row" data-district-id="${escapeHtml(complex.id)}" data-drill-row="district" tabindex="0">
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
            if (footerText) footerText.textContent = `Showing 1-${getComplexStats().length} of ${getComplexStats().length} complexes`;
        }

        syncSiteStatistics();
        window.HydroFlowSyncLocale?.();
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
        group.dataset.ready = "true";

        const buttons = Array.from(group.querySelectorAll("[data-resident-filter]"));
        const cards = Array.from(grid.querySelectorAll("[data-resident-card]"));
        const search = document.querySelector("[data-resident-search]");
        const clearSearch = document.querySelector("[data-resident-search-clear]");
        const count = group.querySelector("[data-resident-filter-count]");
        const empty = document.querySelector("[data-resident-filter-empty]");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let activeFilter = buttons.find((button) => button.classList.contains("is-active"))?.dataset.residentFilter || "all";

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
                const statusMatch = filter === "all" || card.dataset.residentStatus === filter;
                const queryMatch = !query || card.textContent.toLowerCase().includes(query);
                const matchedCard = statusMatch && queryMatch;
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
            const name = sourceCard.querySelector("h4")?.textContent?.trim() || "Resident";
            const apartment = sourceCard.querySelector("h4 + p")?.textContent?.trim() || "";
            const phone = sourceCard.querySelector("p span:last-child")?.textContent?.trim() || "";
            const lastPayment = sourceCard.querySelectorAll("p span:last-child")?.[1]?.textContent?.trim() || "";
            const balance = sourceCard.querySelector(".space-y-3 > .flex span:last-child")?.textContent?.trim() || "";
            const statusValue = sourceCard.dataset.residentStatus || "paid";
            const status = statusValue === "debtor" ? "DEBTORS" : "PAID";
            const avatarImage = sourceCard.querySelector("img.h-12.w-12");
            const avatarInitials = sourceCard.querySelector(".h-12.w-12:not(img)")?.textContent?.trim() || name.split(" ").map((part) => part[0] || "").join("").slice(0, 2).toUpperCase();

            return {
                name,
                apartment,
                phone,
                lastPayment,
                balance,
                status,
                statusValue,
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
                return statusMatch && queryMatch;
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

        const parseResident = (card) => {
            const resident = getResidentById(card.dataset.residentId);
            if (resident) return resident;
            const detailRows = card.querySelectorAll(".bg-white\\/40 p");
            const balance = Number(card.querySelector(".text-xl.font-black")?.textContent.replace(/[^\d.-]/g, "")) || 0;
            return {
                name: card.querySelector("h4")?.textContent.trim() || "Resident",
                apartment: card.querySelector("h4 + p")?.textContent.trim() || "",
                phone: detailRows[0]?.querySelectorAll("span")[1]?.textContent.trim() || "",
                lastPayment: detailRows[1]?.querySelectorAll("span")[1]?.textContent.trim() || "",
                balance,
                status: card.dataset.residentStatus === "debtor" ? "Overdue" : "Paid",
                complexId: card.dataset.complexId,
            };
        };

        const residentPayments = (resident) => {
            const payments = getResidentTransactions(resident.id).slice().sort((a, b) => dateValue(b.date) - dateValue(a.date));
            if (!payments.length) {
                return [{ method: "No payments", amount: "0 UZS", date: resident.lastPayment || "13.04.2026" }];
            }
            return payments.map((payment) => ({
                method: payment.method,
                amount: formatBillingUzs(payment.amount),
                date: payment.date,
            }));
        };

        grid.addEventListener("click", (event) => {
            const button = event.target.closest("[data-resident-billing-history]");
            if (!button) return;
            const card = button.closest("[data-resident-card]");
            if (!card) return;
            event.preventDefault();
            event.stopPropagation();
            const resident = parseResident(card);
            const isDebtor = resident.status === "debtor" || resident.balance < 0;
            const complex = getComplexById(resident.complexId);
            fillDetails({
                title: resident.name,
                subtitle: `${resident.apartment} · ${resident.phone}`,
                status: isDebtor ? "Overdue" : "Paid",
                debt: formatBillingUzs(resident.balance),
                lastPayment: resident.lastPayment,
                health: isDebtor ? "Debt" : "Paid",
                alerts: isDebtor
                    ? "Outstanding balance is active. Send reminder before escalation."
                    : `No active billing alerts for ${complex?.name || "this resident"}.`,
                owner: resident.name,
                technician: "Billing Team",
                sla: isDebtor ? "24h" : "Closed",
                payments: residentPayments(resident),
            });
            openOverlayById("details-drawer");
        });
    };

    const setupResidentialHierarchy = () => {
        const table = document.querySelector("[data-drill-row='district']")?.closest("table");
        if (!table || table.dataset.residentialHierarchyReady === "true") return;
        table.dataset.residentialHierarchyReady = "true";
        const body = table.querySelector("tbody");
        if (!body) return;

        const ownerPool = billingData.residents.map((resident) => ({
            name: resident.name,
            phone: resident.phone,
            email: `${resident.name.toLowerCase().replace(/\s+/g, ".")}@hydroflow.local`,
            photo: resident.photo || "",
        }));

        const districts = Object.fromEntries(getComplexStats().map((complex) => [complex.id, {
            complex: complex.name,
            sector: complex.sector,
            prefix: complex.prefix,
            count: complex.buildings,
            units: complex.units,
            risk: complex.risk,
            tone: complex.tone,
            debt: complex.finances,
            issueEvery: complex.issueEvery,
        }]));

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
            const base = Math.floor(district.units / district.count);
            const remainder = district.units % district.count;
            return base + (index <= remainder ? 1 : 0);
        };
        const buildingName = (district, index) => {
            const suffix = String.fromCharCode(64 + index);
            return `${district.prefix} ${suffix}`;
        };
        const ownerFor = (buildingIndex, unitIndex) => ownerPool[(buildingIndex + unitIndex) % ownerPool.length];
        const apartmentFor = (districtId, buildingIndex, unitIndex) => {
            const district = districts[districtId];
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
            const unitCount = unitsForBuilding(district, index);
            const healthIssue = district.issueEvery && index % district.issueEvery === 0;
            const completion = Math.max(78, Math.min(99, 93 + (index % 6) - (healthIssue ? 9 : 0)));
            const debt = Math.round(district.debt / district.count) + (healthIssue ? 4200000 : index * 175000);
            const debtorCount = Math.max(1, Math.round(unitCount * (healthIssue ? 0.24 : districtId === "harbor" ? 0.17 : 0.07)));
            const paidCount = Math.max(0, unitCount - debtorCount);
            const splitRatio = paidCount === 0 ? Infinity : debtorCount / paidCount;
            const splitTone = splitRatio > 1 ? "is-danger" : splitRatio >= 0.75 ? "is-caution" : "is-healthy";
            const row = document.createElement("tr");
            row.className = "residential-drill-row residential-building-row";
            row.dataset.drillChild = "true";
            row.dataset.drillRow = "building";
            row.dataset.parentDistrict = districtId;
            row.dataset.buildingId = `${districtId}-${index}`;
            row.dataset.buildingIndex = String(index);
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
                            <small>${escapeHtml(district.complex)}</small>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="space-y-1">
                        <p class="text-sm font-bold text-on-surface">${unitCount} <span class="text-xs font-normal text-on-surface-variant" data-i18n-key="Apartments">Apartments</span></p>
                        <p class="text-xs text-on-surface-variant">${8 + (index % 5)} <span data-i18n-key="floors">floors</span> · ${index % 2 ? "A" : "B"} <span data-i18n-key="entrance">entrance</span></p>
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
                    <span class="residential-risk-pill ${healthIssue ? "is-critical" : ""}" data-i18n-key="${healthIssue ? "Review" : district.risk}">${healthIssue ? "Review" : district.risk}</span>
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
        const expandDistrict = (row) => {
            const district = districts[row.dataset.districtId];
            if (!district) return;
            const fragment = document.createDocumentFragment();
            for (let index = 1; index <= district.count; index += 1) {
                fragment.appendChild(renderBuildingRow(row.dataset.districtId, index));
            }
            row.after(fragment);
            row.classList.add("is-expanded");
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
        }
        const syncResidentialLabels = (lang = storage.getItem("hydroflow-lang") || "en") => {
            const labels = {
                en: ["Complex", "Infra", "Systems", "Finance", "Debt", "Actions"],
                ru: ["Комплекс", "Инфра", "Системы", "Финансы", "Долг", "Действия"],
                uz: ["Kompleks", "Infra", "Tizim", "Moliya", "Qarz", "Amal"],
            };
            const fullLabels = ["Complex Name", "Infrastructure", "System Health", "Finances", "Debt Status", "Actions"];
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
                row.classList.remove("hidden", "is-expanded", "residential-smart-match");
                row.setAttribute("aria-expanded", "false");
            });
        };
        const runSmartSearch = () => {
            if (!searchInput) return;
            const query = searchInput.value.trim().toLowerCase();
            resetSmartSearch();
            if (!query) return;

            table.classList.add("residential-smart-search-active");
            let visibleCount = 0;

            getDistrictRows().forEach((districtRow) => {
                const districtId = districtRow.dataset.districtId;
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
                    districtRow.classList.remove("hidden");
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

        table.addEventListener("click", (event) => {
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

        table.addEventListener("click", (event) => {
            const button = event.target.closest(".residential-open-button");
            if (!button) return;
            const row = button.closest("[data-drill-row='building']");
            row?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });

        table.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            const row = event.target.closest("[data-drill-row='district'], [data-drill-row='building']");
            if (!row) return;
            event.preventDefault();
            row.click();
        });

        const fillApartmentDrawer = (data) => {
            const drawer = document.getElementById("apartment-details-drawer");
            if (!drawer) return;
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

        table.addEventListener("click", (event) => {
            const button = event.target.closest("[data-apartment-details]");
            if (!button) return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            button.removeAttribute("data-detail-open");
            fillApartmentDrawer(button.dataset);
            openOverlayById("apartment-details-drawer");
        }, true);

        table.addEventListener("click", async (event) => {
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

        searchInput?.addEventListener("input", () => window.setTimeout(runSmartSearch, 0));
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && searchInput?.value && document.activeElement === searchInput) {
                searchInput.value = "";
                runSmartSearch();
            }
        });
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
        document.querySelectorAll("span").forEach((element) => {
            const key = element.textContent.trim().toLowerCase();
            if (!riskMap[key]) return;
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

    setupBillingDataSync();
    decorateStatusText();
    decorateRiskBadges();
    addSparklines();
    setupResidentFilters();
    setupResidentViewer();
    setupResidentBillingHistory();
    setupResidentialHierarchy();
    updateNotifications();

    const openOverlayById = (id) => {
        const overlay = document.getElementById(id);
        const backdrop = document.querySelector("[data-overlay-backdrop]");
        if (!overlay) return;
        document.querySelectorAll(".app-drawer.is-open").forEach((drawer) => {
            drawer.classList.remove("is-open");
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
        overlay.classList.add("flex", "is-open");
        overlay.setAttribute("aria-hidden", "false");
    };

    const closeOverlayById = (id) => {
        const overlay = document.getElementById(id);
        const backdrop = document.querySelector("[data-overlay-backdrop]");
        if (!overlay) return;
        overlay.classList.add("hidden");
        overlay.classList.remove("is-open", "flex");
        overlay.setAttribute("aria-hidden", "true");
        if (!document.querySelector(".app-drawer.is-open, .app-modal.is-open")) {
            backdrop?.classList.remove("is-visible");
            window.setTimeout(() => backdrop?.classList.add("hidden"), 140);
        }
    };

    document.addEventListener("click", (event) => {
        const openButton = event.target.closest("[data-modal-open]");
        if (!openButton) return;
        const id = openButton.dataset.modalOpen;
        if (id) openOverlayById(id);
    });

    document.addEventListener("click", (event) => {
        const closeButton = event.target.closest("[data-close-overlay]");
        if (!closeButton) return;
        const overlay = closeButton.closest(".app-modal, .app-drawer");
        if (overlay?.id) closeOverlayById(overlay.id);
    });

    const recentCommandKey = "hydroflow-recent-commands";
    const commandPalette = document.getElementById("command-palette");
    const commandInput = document.querySelector("[data-command-input]");
    const commandResults = document.querySelector("[data-command-results]");
    const commandEmpty = document.querySelector("[data-command-empty]");
    const getCommandItems = () => Array.from(document.querySelectorAll("[data-command-results] .command-item"));
    const getRecentCommands = () => {
        try {
            return JSON.parse(storage.getItem(recentCommandKey) || "[]");
        } catch {
            return [];
        }
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
        const recent = getRecentCommands();
        wrap.classList.toggle("hidden", recent.length === 0);
        target.innerHTML = recent.map((item) => `
            <button class="command-recent-chip" data-command-recent-id="${item.id}" type="button">
                <span>${item.title}</span>
            </button>
        `).join("");
    };
    const setActiveCommand = (items, index) => {
        items.forEach((item, itemIndex) => {
            const active = itemIndex === index;
            item.classList.toggle("is-active", active);
            if (active) commandInput?.setAttribute("aria-activedescendant", item.id || "");
        });
    };
    const filterCommands = () => {
        const query = commandInput?.value.trim().toLowerCase() || "";
        const items = getCommandItems();
        let visible = 0;
        items.forEach((item, index) => {
            if (!item.id) item.id = `command-item-${index}`;
            const text = item.textContent.toLowerCase();
            const show = !query || text.includes(query);
            item.classList.toggle("hidden", !show);
            item.querySelectorAll("span, small").forEach((part) => {
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
    };
    const executeCommand = (button) => {
        if (!button) return;
        saveRecentCommand(button);
        if (button.dataset.commandUrl) {
            window.location.href = button.dataset.commandUrl;
            return;
        }
        if (button.dataset.commandAction === "toggle-theme") {
            document.querySelector("[data-theme-toggle]")?.click();
            closeOverlayById("command-palette");
            return;
        }
        if (button.dataset.drawerOpen) {
            closeOverlayById("command-palette");
            window.setTimeout(() => document.querySelector(`[data-drawer-open='${button.dataset.drawerOpen}']`)?.click(), 0);
            return;
        }
        if (button.hasAttribute("data-export-open")) {
            openExportPreview(button);
            return;
        }
    };
    renderRecentCommands();
    commandInput?.addEventListener("input", filterCommands);
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
    document.querySelectorAll("[data-command-suggestion]").forEach((button) => button.addEventListener("click", () => {
        if (!commandInput) return;
        commandInput.value = button.dataset.commandSuggestion || "";
        commandInput.dispatchEvent(new Event("input", { bubbles: true }));
        commandInput.focus();
    }));
    document.addEventListener("click", (event) => {
        const command = event.target.closest("[data-command-results] .command-item");
        if (command) executeCommand(command);
        const recent = event.target.closest("[data-command-recent-id]");
        if (recent) {
            const commandData = getRecentCommands().find((item) => item.id === recent.dataset.commandRecentId);
            const original = getCommandItems().find((item) => (item.dataset.commandId || item.querySelector("span")?.textContent?.trim()) === commandData?.id);
            original?.click();
        }
    });

    const exportModal = document.getElementById("export-preview-modal");
    let selectedExportFormat = "CSV";
    let lastExportSource = document.title;
    let lastExportButton = null;
    let lastExportContext = "default";
    const getVisibleTableRows = (root = document) => Array.from(root.querySelectorAll("tbody tr")).filter((row) => !row.classList.contains("hidden"));
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
        "Action": { ru: "Действие", uz: "Amal" },
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
        "COMPLEXES": { ru: "ЖК", uz: "KOMPLEKSLAR" },
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
        "Maintenance rows": { ru: "Строк обслуживания", uz: "Texnik qatorlar" },
        "Visible table rows": { ru: "Видимые строки таблицы", uz: "Ko'rinadigan jadval qatorlari" },
        "Complex": { ru: "ЖК", uz: "Kompleks" },
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
        "Complex debt": { ru: "Долг ЖК", uz: "Kompleks qarzi" },
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
        "ЖК": { en: "Complex", uz: "Kompleks" },
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
        "Долг ЖК": { en: "Complex debt", uz: "Kompleks qarzi" },
        "Долг дома": { en: "House debt", uz: "Uy qarzi" },
        "Этажей": { en: "Floors", uz: "Qavatlar" },
        "Должников": { en: "Debtors", uz: "Qarzdorlar" },
        "Complexes": { ru: "ЖК", uz: "Komplekslar" },
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
        "Complex Performance Overview": { ru: "Обзор работы ЖК", uz: "Kompleks ishlashi sharhi" },
        "Recent Transaction Log": { ru: "Журнал последних транзакций", uz: "So'nggi tranzaksiyalar jurnali" },
        "System Maintenance Log": { ru: "Журнал обслуживания систем", uz: "Tizim xizmat jurnali" },
        "Residential Complex Management | HydroFlow": { ru: "Управление жилыми комплексами | HydroFlow", uz: "Turar joy komplekslarini boshqarish | HydroFlow" },
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
    const parseDebtHealth = () => Array.from(document.querySelectorAll(".revenue-debt-card .revenue-debt-item")).map((item) => {
        const labels = item.querySelectorAll(".flex.justify-between.items-center.text-xs.font-bold span");
        return {
            "Объект": labels[0]?.textContent.trim() || "",
            "Состояние": labels[1]?.textContent.trim() || "",
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
        return Array.from(table.querySelectorAll("tbody tr")).filter((row) => !row.classList.contains("hidden")).map((row) => {
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
    const buildSystemMaintenanceExportData = () => {
        const exportedAt = new Date();
        const exportedAtIso = exportedAt.toISOString();
        const exportedAtLocal = exportedAt.toLocaleString("en-GB", { timeZone: "Asia/Tashkent", hour12: false });
        const maintenance = parseSystemMaintenanceLog();
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
    const buildBillingDebtExportData = () => {
        const exportedAt = new Date();
        const exportedAtIso = exportedAt.toISOString();
        const exportedAtLocal = exportedAt.toLocaleString("en-GB", { timeZone: "Asia/Tashkent", hour12: false });
        const billing = parseBillingTransactions();
        const isTransactionLog = lastExportContext === "transactions" || (lastExportSource || "").toLowerCase().includes("transaction");
        const debt = parseDebtHealth();
        const debtors = parseDebtorResidents();
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
        const sheets = datasets.maintenanceLog
            ? `${sheetXml("Maintenance", datasets.apartments)}
${sheetXml("Report", datasets.report)}`
            : datasets.transactionLog
            ? `${sheetXml("Transactions", datasets.apartments)}
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
        const sections = datasets.maintenanceLog
            ? [
                { title: "REPORT", rows: datasets.report },
                { title: "SYSTEM_MAINTENANCE_LOG", rows: datasets.apartments },
            ]
            : datasets.transactionLog
            ? [
                { title: "REPORT", rows: datasets.report },
                { title: "RECENT_TRANSACTION_LOG", rows: datasets.apartments },
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
        const visibleRows = getVisibleTableRows(getExportHostFromButton(sourceButton)).length || getVisibleTableRows().length;
        const isTransactionLog = lastExportContext === "transactions" || source.toLowerCase().includes("transaction");
        const isMaintenanceLog = lastExportContext === "maintenance" || source.toLowerCase().includes("maintenance log");
        exportModal?.querySelector("[data-export-source-label]")?.replaceChildren(document.createTextNode(source));
        exportModal?.querySelector("[data-export-rows]")?.replaceChildren(document.createTextNode(visibleRows ? `${visibleRows} visible rows` : "Current page summary"));
        exportModal?.querySelector("[data-export-summary]")?.replaceChildren(document.createTextNode(isMaintenanceLog
            ? `${selectedExportFormat} preview includes maintenance tasks, location, priority, status, Asia/Tashkent timestamp and local prototype metadata.`
            : isTransactionLog
            ? `${selectedExportFormat} preview includes visible transaction rows, invoice numbers, payment status, Asia/Tashkent timestamp and local prototype metadata.`
            : `${selectedExportFormat} preview includes visible rows, selected filters, Asia/Tashkent timestamp and local prototype metadata.`));
        openOverlayById("export-preview-modal");
    };
    document.querySelectorAll("[data-export-format] button").forEach((button) => button.addEventListener("click", () => {
        const requestedFormat = button.dataset.format || "CSV";
        selectedExportFormat = requestedFormat;
        document.querySelectorAll("[data-export-format] button").forEach((item) => item.classList.toggle("is-active", (item.dataset.format || "CSV") === selectedExportFormat));
        const isTransactionLog = lastExportContext === "transactions" || (lastExportSource || "").toLowerCase().includes("transaction");
        const isMaintenanceLog = lastExportContext === "maintenance" || (lastExportSource || "").toLowerCase().includes("maintenance log");
        exportModal?.querySelector("[data-export-summary]")?.replaceChildren(document.createTextNode(isMaintenanceLog
            ? `${selectedExportFormat} preview includes maintenance tasks, location, priority, status, Asia/Tashkent timestamp and local prototype metadata.`
            : isTransactionLog
            ? `${selectedExportFormat} preview includes visible transaction rows, invoice numbers, payment status, Asia/Tashkent timestamp and local prototype metadata.`
            : `${selectedExportFormat} preview includes visible rows, selected filters, Asia/Tashkent timestamp and local prototype metadata.`));
    }));
    document.addEventListener("click", (event) => {
        const exportButton = event.target.closest("[data-export-open], [data-table-action='export']");
        if (!exportButton) return;
        event.preventDefault();
        openExportPreview(exportButton);
    }, true);
    document.querySelector("[data-export-copy]")?.addEventListener("click", async () => {
        const summary = exportModal?.querySelector("[data-export-summary]")?.textContent || "HydroFlow export preview";
        try {
            await navigator.clipboard?.writeText(summary);
            toast("Export summary copied", summary, "success");
        } catch {
            toast("Export summary ready", summary, "info");
        }
    });
    document.querySelector("[data-export-download]")?.addEventListener("click", async () => {
        const datasets = getExportDataForContext();
        const filePrefix = datasets.maintenanceLog
            ? "hydroflow-system-maintenance-log"
            : datasets.transactionLog
            ? "hydroflow-recent-transactions"
            : "hydroflow-report";
        if (selectedExportFormat === "XLSX") {
            const workbookXml = createExcelXmlWorkbook(datasets);
            downloadBlob(workbookXml, "application/vnd.ms-excel;charset=utf-8", `${filePrefix}.xls`);
            toast("Download preview ready", "Excel report generated.", "success");
            return;
        }
        if (selectedExportFormat === "PDF") {
            const pdfContent = await createPdfFromLines(createPdfReportLines(datasets));
            downloadBlob(pdfContent, "application/pdf", `${filePrefix}.pdf`);
            toast("Download preview ready", "PDF report generated.", "success");
            return;
        }
        const reportRows = [
            ...datasets.report,
            ...datasets.complexes,
            ...datasets.houses,
            ...datasets.apartments,
            ...datasets.residents,
        ];
        const csvContent = buildSectionedCsv(datasets);
        downloadBlob(csvContent, "text/csv;charset=utf-8", `${filePrefix}.csv`);
        toast("Download preview ready", "CSV report generated.", "success");
    });
    const assignStatusModal = document.getElementById("assign-status-modal");
    const assignStatusOptionsRoot = assignStatusModal?.querySelector("[data-assign-status-options]");
    const assignStatusSummary = assignStatusModal?.querySelector("[data-assign-status-summary]");
    const assignStatusTarget = assignStatusModal?.querySelector("[data-assign-status-target]");
    const assignStatusNote = assignStatusModal?.querySelector("[data-assign-status-note]");
    const assignStatusApply = assignStatusModal?.querySelector("[data-assign-status-apply]");
    let pendingStatusAssignment = { rows: [], button: null, context: "default", value: "" };
    const assignedStatusStorageKey = "hydroflow-assigned-statuses-v2";
    const statusLabel = (labels) => labels?.[exportLang()] || labels?.en || "";
    const readAssignedStatusStore = () => {
        try {
            return JSON.parse(storage.getItem(assignedStatusStorageKey) || "{}");
        } catch {
            return {};
        }
    };
    const writeAssignedStatusStore = (store) => {
        storage.setItem(assignedStatusStorageKey, JSON.stringify(store));
    };
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
    const persistStatusAssignment = (context, rows, statusConfig) => {
        const store = readAssignedStatusStore();
        rows.forEach((row) => {
            const key = getStatusRowKey(row, context);
            if (key) store[key] = statusConfig.value;
            const legacyKey = getLegacyStatusRowKey(row, context);
            if (legacyKey && legacyKey !== key) store[legacyKey] = statusConfig.value;
        });
        writeAssignedStatusStore(store);
    };
    const applyStoredStatusToRow = (row, context, statusIndex = -1, store = readAssignedStatusStore()) => {
        const value = store[getStatusRowKey(row, context)] || store[getLegacyStatusRowKey(row, context)];
        if (!value) return;
        const options = assignStatusCatalog[context] || assignStatusCatalog.default;
        const option = options.find((item) => item.value === value);
        if (option) applyStatusToRow(row, option, statusIndex, context);
    };
    const restoreAssignedStatuses = () => {
        const store = readAssignedStatusStore();
        if (!Object.keys(store).length) return;
        document.querySelectorAll("[data-table-action='status']").forEach((button) => {
            const context = detectExportContext(button);
            const statusIndex = getStatusColumnIndex(button);
            getRowsForStatusAction(button).forEach((row) => {
                applyStoredStatusToRow(row, context, statusIndex, store);
            });
        });
    };
    const observeAssignedStatusRows = () => {
        const store = readAssignedStatusStore();
        if (!Object.keys(store).length || !("MutationObserver" in window)) return;
        document.querySelectorAll(".table-workspace").forEach((workspace) => {
            const statusButton = workspace.previousElementSibling?.querySelector("[data-table-action='status']");
            if (!statusButton || workspace.dataset.assignedStatusObserver === "true") return;
            workspace.dataset.assignedStatusObserver = "true";
            const context = detectExportContext(statusButton);
            const statusIndex = getStatusColumnIndex(statusButton);
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (!(node instanceof HTMLElement)) return;
                        const rows = node.matches?.("tr") ? [node] : Array.from(node.querySelectorAll?.("tr") || []);
                        rows.forEach((row) => applyStoredStatusToRow(row, context, statusIndex));
                    });
                });
            });
            observer.observe(workspace, { childList: true, subtree: true });
        });
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
        if (assignStatusSummary) assignStatusSummary.textContent = `${selectedRows.length} selected rows will be updated locally.`;
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
    assignStatusApply?.addEventListener("click", () => {
        const options = assignStatusCatalog[pendingStatusAssignment.context] || assignStatusCatalog.default;
        const option = options.find((item) => item.value === pendingStatusAssignment.value);
        if (!option || !pendingStatusAssignment.rows.length || !pendingStatusAssignment.button) {
            toast("Select rows first", "Choose one or more rows before assigning status.", "warning");
            return;
        }
        const statusIndex = getStatusColumnIndex(pendingStatusAssignment.button);
        pendingStatusAssignment.rows.forEach((row) => applyStatusToRow(row, option, statusIndex, pendingStatusAssignment.context));
        persistStatusAssignment(pendingStatusAssignment.context, pendingStatusAssignment.rows, option);
        observeAssignedStatusRows();
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
        toast("Status assigned", `${statusLabel(option.label)} applied to ${pendingStatusAssignment.rows.length} rows.`, "success");
        pendingStatusAssignment = { rows: [], button: null, context: "default", value: "" };
    });
    restoreAssignedStatuses();
    observeAssignedStatusRows();

    const updateTableEmptyStates = () => {
        document.querySelectorAll(".table-workspace").forEach((host) => {
            const rows = Array.from(host.querySelectorAll("tbody tr"));
            const visible = rows.filter((row) => !row.classList.contains("hidden")).length;
            let state = host.querySelector("[data-table-empty-state]");
            if (!state) {
                state = document.createElement("div");
                state.className = "table-empty-state hidden";
                state.dataset.tableEmptyState = "true";
                state.innerHTML = '<span class="material-symbols-outlined">search_off</span><strong>No transactions for selected filters</strong><small>Try another search term or reset filters. Local static fallback remains available.</small><button type="button" data-table-empty-reset>Retry</button>';
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

    document.querySelectorAll("[data-notification-pin]").forEach((button) => button.addEventListener("click", (event) => {
        event.stopPropagation();
        const item = button.closest(".notification-item");
        if (!item) return;
        const pinned = item.dataset.pinned !== "true";
        const current = getPinnedNotificationIds().filter((id) => id !== item.dataset.notificationId);
        savePinnedNotificationIds(pinned ? [item.dataset.notificationId, ...current] : current);
        setNotificationPinnedState(item, pinned);
        updateNotifications();
        toast(pinned ? "Notification pinned" : "Notification unpinned", item.querySelector("p.text-sm")?.textContent || "", "info");
    }));
    document.querySelectorAll("[data-notification-action]").forEach((button) => button.addEventListener("click", () => {
        const item = button.closest(".notification-item");
        const state = item?.querySelector("[data-notification-state]");
        if (state) {
            state.textContent = button.dataset.notificationAction || "Action updated";
            state.classList.remove("hidden");
        }
        if (item) item.dataset.read = "true";
        updateNotifications();
    }));
    document.querySelector("[data-clear-read]")?.addEventListener("click", () => {
        document.querySelectorAll("[data-notification-list] .notification-item[data-read='true']").forEach((item) => {
            if (item.dataset.pinned !== "true") item.remove();
        });
        updateNotifications();
        toast("Read notifications cleared", "Pinned items stay visible.", "info");
    });

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

        drawer.querySelector("[data-audit-action='add-note']")?.addEventListener("click", () => {
            const item = document.createElement("div");
            item.className = "audit-event";
            item.dataset.auditEvent = "true";
            item.dataset.type = "note";
            item.innerHTML = '<span class="audit-event-icon material-symbols-outlined">edit_note</span><div><time>14 Apr 2026, 09:41</time><p>Local support note added for prototype review.</p><span>Note</span></div>';
            timeline?.prepend(item);
            activeType = "all";
            filters.forEach((filter) => filter.classList.toggle("is-active", filter.dataset.auditFilter === "all"));
            refreshAudit();
            toast("Audit note added", "Stored locally for this prototype session.", "success");
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
            toast("Audit log exported", "Local CSV preview generated.", "success");
        });

        refreshAudit();
    };

    const setupSupportTools = () => {
        const drawer = document.getElementById("support-drawer");
        if (!drawer || drawer.dataset.supportReady === "true") return;
        drawer.dataset.supportReady = "true";
        drawer.querySelectorAll("[data-support-action]").forEach((button) => button.addEventListener("click", async () => {
            const action = button.dataset.supportAction;
            if (action === "copy-summary") {
                const summary = "HydroFlow local prototype | Backend: Not connected | Timezone: Asia/Tashkent | Last local save: 13.04.2026, 09:41";
                try {
                    await navigator.clipboard?.writeText(summary);
                    toast("Support summary copied", summary, "success");
                } catch {
                    toast("Support summary ready", summary, "info");
                }
            }
            if (action === "open-checklist") {
                toast("Support checklist opened", "Verify theme, language, filters, export preview and audit log.", "info");
            }
            if (action === "report-ui") {
                document.querySelector("[data-audit-action='add-note']")?.click();
                toast("UI issue note created", "A local audit note was added.", "warning");
            }
        }));
    };

    setupAuditTools();
    setupSupportTools();

    document.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        const actionKey = button.dataset.actionKey || button.dataset.i18nKey || button.textContent.trim();
        const label = actionKey.toLowerCase();
        const lang = storage.getItem("hydroflow-lang") || "en";
        if (label === "export") toast(translateValue("Export started", lang), "A static report preview is being prepared.");
        if (label.includes("send reminder")) toast(translateValue("Reminder queued", lang), "This will connect to backend messaging later.");
        if (label.includes("assign technician")) toast(translateValue("Technician assignment queued", lang), "A future backend task will own this action.", "info");
        if (label.includes("apply filters")) toast(translateValue("Filters applied", lang), "Static preview filters updated.");
        if (label.includes("reset filters")) toast(translateValue("Filters reset", lang), "Default filter chips restored.");
        if (label.includes("create request")) toast(translateValue("Request created", lang), "Saved locally for this prototype session.");
        if (label.includes("open checklist")) toast(translateValue("Checklist opened", lang), "Static operations checklist is ready for review.", "info");
        if (label.includes("edit profile")) {
            const message = {
                en: "Profile editor will connect to the backend admin panel later.",
                ru: "Редактор профиля подключится после добавления backend admin panel.",
                uz: "Profil muharriri keyin backend admin panelga ulanadi.",
            };
            toast(translateValue("Profile update queued", lang), message[lang] || message.en, "info");
        }
        if (label.includes("sign out")) {
            const message = {
                en: "Authentication backend is not connected yet.",
                ru: "Backend авторизации пока не подключён.",
                uz: "Autentifikatsiya backend hali ulanmagan.",
            };
            toast(translateValue("Sign out unavailable", lang), message[lang] || message.en, "warning");
        }
    });
})();
