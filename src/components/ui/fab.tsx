
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  HelpCircle,
  X,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContactForm } from '@/components/forms/ContactForm';

export interface FabProps {
  icon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
  showMenu?: boolean;
}

export function Fab({ 
  icon = <HelpCircle className="h-5 w-5" />, 
  position = 'bottom-right',
  className,
  showMenu = false
}: FabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6', 
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const menuOptions = [
    {
      icon: <Mail className="h-4 w-4" />,
      label: 'Contact Us',
      action: () => setShowContactForm(true),
      description: 'Send us a message'
    },
    {
      icon: <Phone className="h-4 w-4" />,
      label: 'WhatsApp',
      action: () => window.open('https://wa.me/18687865357?text=Hello, I need help with Tavara services', '_blank'),
      description: 'Chat on WhatsApp'
    },
    {
      icon: <HelpCircle className="h-4 w-4" />,
      label: 'FAQ',
      action: () => window.open('/faq', '_self'),
      description: 'Common questions'
    }
  ];

  const handleMainClick = () => {
    if (showMenu) {
      setIsOpen(!isOpen);
    } else {
      // Default action when no menu
      setShowContactForm(true);
    }
  };

  return (
    <>
      <div className={cn('fixed z-50', positionClasses[position])}>
        {/* Menu Options */}
        <AnimatePresence>
          {isOpen && showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 mb-2"
            >
              <Card className="w-64 shadow-lg">
                <CardContent className="p-3 space-y-2">
                  {menuOptions.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 hover:bg-muted"
                        onClick={() => {
                          option.action();
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-1.5 rounded-full bg-primary/10">
                            {option.icon}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full shadow-lg transition-all duration-200",
              className
            )}
            onClick={handleMainClick}
          >
            <motion.div
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen && showMenu ? <X className="h-5 w-5" /> : icon}
            </motion.div>
          </Button>
        </motion.div>
      </div>

      {/* Contact Form Modal */}
      <ContactForm 
        open={showContactForm}
        onOpenChange={setShowContactForm}
      />
    </>
  );
}
