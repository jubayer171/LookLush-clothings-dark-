"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuditLog } from "./audit-log-context"

export interface ContactInfo {
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  socialMedia: {
    instagram: string
    twitter: string
    facebook: string
  }
  businessHours: {
    weekdays: string
    weekends: string
  }
}

interface ContactContextType {
  contactInfo: ContactInfo
  updateContactInfo: (info: Partial<ContactInfo>) => void
}

const ContactContext = createContext<ContactContextType | undefined>(undefined)

const defaultContactInfo: ContactInfo = {
  email: "hello@looklush.com",
  phone: "+1 (555) 123-4567",
  address: "123 Fashion Avenue",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  socialMedia: {
    instagram: "@looklush",
    twitter: "@looklush",
    facebook: "LookLushOfficial",
  },
  businessHours: {
    weekdays: "9:00 AM - 8:00 PM",
    weekends: "10:00 AM - 6:00 PM",
  },
}

export function ContactProvider({ children }: { children: ReactNode }) {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo)
  const { logEvent } = useAuditLog()

  useEffect(() => {
    const savedContact = localStorage.getItem("contactInfo")
    if (savedContact) {
      setContactInfo(JSON.parse(savedContact))
    }
  }, [])

  const updateContactInfo = (info: Partial<ContactInfo>) => {
    const updatedInfo = { ...contactInfo, ...info }
    setContactInfo(updatedInfo)
    localStorage.setItem("contactInfo", JSON.stringify(updatedInfo))
    logEvent({
      action: "UPDATE_CONTACT_INFO",
      details: `Contact information updated.`,
    })
  }

  return <ContactContext.Provider value={{ contactInfo, updateContactInfo }}>{children}</ContactContext.Provider>
}

export function useContact() {
  const context = useContext(ContactContext)
  if (context === undefined) {
    throw new Error("useContact must be used within a ContactProvider")
  }
  return context
}
