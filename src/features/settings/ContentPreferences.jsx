import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Switch } from '../../components/ui/FormElements';

export default function ContentPreferences() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Show NSFW Content</span>
            <Switch disabled />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">Autoplay Videos</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">Show Recommended Content</span>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}