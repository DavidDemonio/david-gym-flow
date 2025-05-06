import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "../hooks/use-toast";

// Update the EmailConfig type to restrict secureType
type SecureType = "TLS" | "SSL";

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  secure: boolean;
  secureType: SecureType;
}

export function EmailSettingsForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EmailConfig>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    secure: true,
    secureType: "TLS" as SecureType // Explicitly cast to SecureType
  });
  
  useEffect(() => {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('email_config');
    if (savedConfig) {
      setFormData(JSON.parse(savedConfig));
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'secure') {
      // Handle boolean checkbox
      setFormData(prev => ({
        ...prev,
        [name]: e.target.checked
      }));
    } else if (name === 'smtpPort') {
      // Handle port as number
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value)
      }));
    } else if (name === 'secureType') {
      // Handle secureType as the correct type
      setFormData(prev => ({
        ...prev,
        [name]: value as SecureType
      }));
    } else {
      // Handle other string fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem('email_config', JSON.stringify(formData));
    
    toast({
      title: "Configuración guardada",
      description: "La configuración del correo electrónico se ha guardado correctamente",
    });
  };

  // Fix the secureType handling in presets
  const applyPreset = (preset: string) => {
    if (preset === 'gmail') {
      setFormData({
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: '',
        secure: true,
        secureType: 'TLS' as SecureType
      });
    } else if (preset === 'hotmail') {
      setFormData({
        smtpHost: 'smtp-mail.outlook.com',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: '',
        secure: true,
        secureType: 'TLS' as SecureType
      });
    } else if (preset === 'zoho') {
      setFormData({
        smtpHost: 'smtp.zoho.eu',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: '',
        secure: false,
        secureType: 'TLS' as SecureType
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="smtpHost">SMTP Host</Label>
        <Input
          type="text"
          id="smtpHost"
          name="smtpHost"
          value={formData.smtpHost}
          onChange={handleChange}
          placeholder="smtp.example.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="smtpPort">SMTP Port</Label>
        <Input
          type="number"
          id="smtpPort"
          name="smtpPort"
          value={formData.smtpPort}
          onChange={handleChange}
          placeholder="587"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="smtpUser">SMTP User</Label>
        <Input
          type="text"
          id="smtpUser"
          name="smtpUser"
          value={formData.smtpUser}
          onChange={handleChange}
          placeholder="user@example.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="smtpPassword">SMTP Password</Label>
        <Input
          type="password"
          id="smtpPassword"
          name="smtpPassword"
          value={formData.smtpPassword}
          onChange={handleChange}
          placeholder="Password"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fromEmail">From Email</Label>
        <Input
          type="email"
          id="fromEmail"
          name="fromEmail"
          value={formData.fromEmail}
          onChange={handleChange}
          placeholder="app@example.com"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Label htmlFor="secure">Secure</Label>
        <Input
          type="checkbox"
          id="secure"
          name="secure"
          checked={formData.secure}
          onChange={handleChange}
        />
      </div>
      
      {formData.secure && (
        <div className="space-y-2">
          <Label htmlFor="secureType">Secure Type</Label>
          <Select value={formData.secureType} onValueChange={(value) => setFormData(prev => ({ ...prev, secureType: value as SecureType }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TLS">TLS</SelectItem>
              <SelectItem value="SSL">SSL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="flex space-x-4">
        <Button type="submit">Guardar configuración</Button>
        
        <Button type="button" variant="secondary" onClick={() => applyPreset('gmail')}>
          Gmail
        </Button>
        <Button type="button" variant="secondary" onClick={() => applyPreset('hotmail')}>
          Hotmail
        </Button>
        <Button type="button" variant="secondary" onClick={() => applyPreset('zoho')}>
          Zoho
        </Button>
      </div>
    </form>
  );
}
