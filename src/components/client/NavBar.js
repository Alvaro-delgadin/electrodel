import {
  Toolbar,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  ElectricalServices,
  Light,
  WbTwighlight,
  WbIncandescent,
  Build,
} from "@mui/icons-material";

export default function NavBar() {
  return (
    <Toolbar sx={{ display: { xs: "none", lg: "flex" } }}>
      <BottomNavigation
        showLabels
        sx={{
          height: "5rem",
          alignItems: "center",
          borderRadius: "1rem",
          "& .MuiBottomNavigationAction-root": {
            minWidth: "9rem",
            height: "100%",
            padding: 0,
            color: "black",
            gap: "0.4rem",
            ".MuiBottomNavigationAction-label": {
              fontSize: "0.8rem",
              fontWeight: 600,
            },
          },
        }}
      >
        <BottomNavigationAction label="Iluminación interior" icon={<Light />} />
        <BottomNavigationAction
          label="Iluminación exterior"
          icon={<WbTwighlight />}
        />
        <BottomNavigationAction
          label="Bombillas y lámparas"
          icon={<WbIncandescent />}
        />
        <BottomNavigationAction
          label="Electricidad"
          icon={<ElectricalServices />}
        />
        <BottomNavigationAction label="Accesorios" icon={<Build />} />
      </BottomNavigation>
    </Toolbar>
  );
}
