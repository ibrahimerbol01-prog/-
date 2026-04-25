const TelegramBot = require('node-telegram-bot-api')
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })

console.log('KASPY Bot started...')

// Handle text messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text
  const username = msg.from.username

  // Check if message matches link code pattern
  const linkCodeMatch = text.match(/kaspy_link_([a-z0-9]{6})/)

  if (linkCodeMatch) {
    const code = linkCodeMatch[0]

    try {
      // Find profile with this link code
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('link_code', code)
        .single()

      if (error || !profile) {
        await bot.sendMessage(chatId, '❌ Код не найден или уже использован.')
        return
      }

      // Update profile with Telegram info
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          telegram_id: chatId,
          telegram_username: username,
          link_code: null // Clear the code after use
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error(updateError)
        await bot.sendMessage(chatId, '❌ Ошибка привязки аккаунта.')
        return
      }

      await bot.sendMessage(
        chatId,
        `✅ Аккаунт привязан!\n\nТеперь твой профиль "${profile.full_name}" работает и на сайте, и в боте.`
      )

    } catch (error) {
      console.error(error)
      await bot.sendMessage(chatId, '❌ Произошла ошибка.')
    }
  } else {
    // Handle other messages
    await bot.sendMessage(
      chatId,
      'Привет! Отправь мне код привязки из твоего профиля на сайте KASPY, чтобы связать аккаунты.\n\nПример: kaspy_link_abc123'
    )
  }
})

// Handle callback queries (for inline keyboards if needed)
bot.on('callback_query', async (query) => {
  // Handle button presses here if needed
})

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error)
})

process.on('SIGINT', () => {
  console.log('Bot stopped')
  process.exit()
})