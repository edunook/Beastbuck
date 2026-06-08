import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AccessDenied() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-status-danger/30">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-status-danger/10 text-status-danger rounded-full flex items-center justify-center mx-auto mb-4 border border-status-danger/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </div>
          <CardTitle className="text-2xl text-status-danger">Access Restricted</CardTitle>
          <CardDescription>You do not have the required permissions to view this sector.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link to="/">
            <Button variant="secondary">Return to Safety</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
