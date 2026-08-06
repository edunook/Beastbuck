import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function EventsSection() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Event items will be populated here */}
          <div className="text-center py-8 text-text-muted">
            No upcoming events
          </div>
        </div>
      </CardContent>
    </Card>
  );
}