import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const guardImplementations = {
  "hasRequiredDocs": `
// guards/si/hasRequiredDocs.ts
import { GuardResult } from '../types';

export async function hasRequiredDocs(ctx: GuardContext): Promise<GuardResult> {
  const { shipment_id, si_id } = ctx;
  
  // Check for required documents
  const docs = await ctx.docs.list({ si_id });
  const invoice = docs.find(d => d.type === 'commercial_invoice' && d.status === 'valid');
  const packingList = docs.find(d => d.type === 'packing_list' && d.status === 'valid');
  
  if (!invoice) {
    return {
      passed: false,
      code: 'MISSING_INVOICE',
      message: 'Commercial invoice is required',
      actions: ['upload_invoice']
    };
  }
  
  if (!packingList) {
    return {
      passed: false,
      code: 'MISSING_PACKING_LIST', 
      message: 'Packing list is required',
      actions: ['upload_packing_list']
    };
  }
  
  return { passed: true };
}`,
  
  "partiesVerified": `
// guards/si/partiesVerified.ts
export async function partiesVerified(ctx: GuardContext): Promise<GuardResult> {
  const { shipment_id } = ctx;
  const shipment = await ctx.shipments.get(shipment_id);
  
  // Verify shipper
  if (!shipment.parties?.shipper?.tax_id) {
    return {
      passed: false,
      code: 'SHIPPER_INCOMPLETE',
      message: 'Shipper tax ID is required',
      actions: ['complete_shipper_details']
    };
  }
  
  // Verify consignee
  if (!shipment.parties?.consignee?.address) {
    return {
      passed: false,
      code: 'CONSIGNEE_INCOMPLETE', 
      message: 'Consignee address is required',
      actions: ['complete_consignee_details']
    };
  }
  
  // Check compliance screening
  const complianceStatus = await ctx.compliance.checkParties(shipment.parties);
  if (complianceStatus === 'flagged') {
    return {
      passed: false,
      code: 'COMPLIANCE_FLAGGED',
      message: 'Parties failed compliance screening',
      actions: ['review_compliance', 'request_license']
    };
  }
  
  return { passed: true };
}`,

  "bookingRefPresent": `
// guards/si/bookingRefPresent.ts  
export async function bookingRefPresent(ctx: GuardContext): Promise<GuardResult> {
  const { shipment_id } = ctx;
  const shipment = await ctx.shipments.get(shipment_id);
  
  // Check if booking reference exists
  if (shipment.booking_id) {
    return { passed: true };
  }
  
  // Check if auto-booking is enabled for this customer/route
  const customer = await ctx.customers.get(shipment.customer_id);
  const autoBookingEnabled = customer.settings?.auto_booking_enabled || false;
  
  if (autoBookingEnabled) {
    // Verify route is supported for auto-booking
    const routeSupported = await ctx.booking.isAutoBookingSupported(
      shipment.transport_legs[0]?.origin_locode,
      shipment.transport_legs[0]?.destination_locode
    );
    
    if (!routeSupported) {
      return {
        passed: false,
        code: 'AUTO_BOOKING_NOT_SUPPORTED',
        message: 'Auto-booking not available for this route',
        actions: ['create_booking_manually', 'assign_existing_booking']
      };
    }
    
    return { passed: true };
  }
  
  return {
    passed: false,
    code: 'BOOKING_REF_MISSING',
    message: 'Booking reference required',
    actions: ['create_booking', 'assign_existing_booking']
  };
}`
};

export default function SiGuards() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Guards Implementation: Shipping Instructions</CardTitle>
        <Badge variant="secondary">/stateflow/guards/v1/si/*.ts</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(guardImplementations).map(([name, code]) => (
          <div key={name}>
            <h3 className="font-semibold mb-2">{name}</h3>
            <pre className="bg-gray-800 text-white p-4 rounded-md text-xs overflow-auto">
              {code.trim()}
            </pre>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}