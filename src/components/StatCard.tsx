import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function StatCard({
  title,
  value,
  icon,
  color = "primary.main",
  hint,
}: {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  hint?: string;
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {icon && (
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              bgcolor: color,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.25 }}>
            {value}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
