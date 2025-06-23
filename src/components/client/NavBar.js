import {
  Toolbar,
  BottomNavigation,
  BottomNavigationAction,
  Divider,
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
    <Toolbar>
      <BottomNavigation
        showLabels
        sx={{
          height: "5rem",
          bgcolor: "#f5f5f5",
          alignItems: "center",
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
        <Divider orientation="vertical" sx={{ height: "3rem" }} />
        <BottomNavigationAction
          label="Iluminación exterior"
          icon={<WbTwighlight />}
        />
        <Divider orientation="vertical" sx={{ height: "3rem" }} />
        <BottomNavigationAction
          label="Bombillas y lámparas"
          icon={<WbIncandescent />}
        />
        <Divider orientation="vertical" sx={{ height: "3rem" }} />
        <BottomNavigationAction
          label="Electricidad"
          icon={<ElectricalServices />}
        />
        <Divider orientation="vertical" sx={{ height: "3rem" }} />
        <BottomNavigationAction label="Accesorios" icon={<Build />} />
      </BottomNavigation>
    </Toolbar>
  );
}
