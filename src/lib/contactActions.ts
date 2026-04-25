'use client'

import { useState } from 'react'

interface ContactActionsProps {
  applicantName: string
  applicantPhone: string
  jobTitle: string
}

export function useContactActions({ applicantName, applicantPhone, jobTitle }: ContactActionsProps) {
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  const handleWhatsApp = () => {
    if (!applicantPhone) {
      alert('Номер телефона не указан')
      return
    }
    
    // Format phone number for WhatsApp (remove + and spaces)
    const formattedPhone = applicantPhone.replace(/[\s+()-]/g, '')
    const message = `Привет ${applicantName}! Спасибо за интерес к вакансии "${jobTitle}". Мы хотим узнать о вас больше.`
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
  }

  const handlePhone = () => {
    if (!applicantPhone) {
      alert('Номер телефона не указан')
      return
    }
    setShowPhoneModal(true)
  }

  const handleDial = () => {
    window.location.href = `tel:${applicantPhone}`
    setShowPhoneModal(false)
  }

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(applicantPhone)
    alert('Номер скопирован в буфер обмена')
    setShowPhoneModal(false)
  }

  return {
    handleWhatsApp,
    handlePhone,
    handleDial,
    handleCopyPhone,
    showPhoneModal,
    setShowPhoneModal
  }
}

export function PhoneModal({ isOpen, phone, applicantName, onClose, onDial, onCopy }: any) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 max-w-xs w-full border border-border">
        <h3 className="text-lg font-semibold text-primary mb-4">Контакт: {applicantName}</h3>
        
        <div className="bg-primary/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-secondary mb-2">Номер телефона</p>
          <p className="text-xl font-semibold text-primary">{phone}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onDial}
            className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition font-semibold"
          >
            Позвонить
          </button>
          <button
            onClick={onCopy}
            className="w-full px-4 py-2 bg-primary/50 text-primary rounded-lg hover:bg-primary/70 transition"
          >
            Скопировать номер
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-border text-secondary rounded-lg hover:bg-primary/10 transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
