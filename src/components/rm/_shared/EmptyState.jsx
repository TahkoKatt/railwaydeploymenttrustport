import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EmptyState = ({ 
  icon: IconComponent, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  return (
    <Card 
      className="bg-white shadow-sm" 
      style={{ 
        borderRadius: '16px',
        fontFamily: 'Montserrat, sans-serif',
        boxShadow: '0 6px 18px rgba(0,0,0,.06)'
      }}
    >
      <CardContent className="py-12 text-center">
        {IconComponent && (
          <div className="mb-4 flex justify-center">
            <div className="p-4 rounded-full bg-gray-100">
              <IconComponent className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} style={{ backgroundColor: '#4472C4', color: 'white' }}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(EmptyState);