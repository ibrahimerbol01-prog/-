# KASPY - Работа в Актау

Платформа для поиска работы и сотрудников в Актау с единой аутентификацией через сайт и Telegram бот.

## Настройка

### 1. Supabase

1. Создайте проект на [Supabase](https://supabase.com)
2. Выполните SQL из файла `database.sql` в Supabase SQL Editor
3. В Authentication → Providers → Google → Enable
4. Добавьте Site URL: `https://80ncax4h6t49q48fks62z9tzf.bolt.host`
5. Добавьте Redirect URL: `https://80ncax4h6t49q48fks62z9tzf.bolt.host/auth/callback`

### 2. Переменные окружения

Создайте `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен и добавьте в `.env.local`
3. Запустите бота: `node bot.js`

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Функционал

- ✅ Аутентификация через Google
- ✅ Онбординг с выбором роли (работник/работодатель)
- ✅ Профиль пользователя
- ✅ Привязка Telegram аккаунта
- ✅ Защищенные маршруты
- ✅ Telegram бот для взаимодействия

## Структура проекта

- `src/app/auth/` - Страницы аутентификации
- `src/app/profile/` - Профиль пользователя
- `src/app/employers/` - Дашборд работодателя
- `src/app/worker/` - Дашборд работника
- `src/components/` - Компоненты
- `src/lib/` - Утилиты (Supabase клиент)
- `bot.js` - Telegram бот
