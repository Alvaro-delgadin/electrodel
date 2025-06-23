import { IconButton, Badge } from "@mui/material";
import { Search, ShoppingCart, Person } from "@mui/icons-material";
export default function HeaderActions() {
  return (
    <>
      <IconButton>
        <Search sx={{ fontSize: "2rem" }} />
      </IconButton>
      <IconButton aria-label="cart">
        <Badge
          badgeContent={4}
          color="primary"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "medium",
              height: "1.5rem",
              width: "1.5rem",
              borderRadius: "1rem",
            },
          }}
        >
          <ShoppingCart sx={{ fontSize: "1.8rem" }} />
        </Badge>
      </IconButton>
      <IconButton aria-label="user">
        <Person sx={{ fontSize: "2rem" }} />
      </IconButton>
    </>
  );
}
