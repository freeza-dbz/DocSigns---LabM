import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Button from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 transition-colors duration-200">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8">
          <AlertCircle className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
          <p className="text-lg text-text-secondary mb-2">Page not found</p>
          <p className="text-sm text-text-muted mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => navigate("/")}
              variant="primary"
              fullWidth
            >
              Go Home
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              fullWidth
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
