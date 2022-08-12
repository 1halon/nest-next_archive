import {
  AppBar,
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { blue, deepOrange, green, grey, lightBlue } from "@mui/material/colors";
import { AddOutlined, Check, PageviewOutlined } from "@mui/icons-material";
import { useState } from "react";

type Props = {
  name: string;
};

const Navigation = ({ name }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [savedFilter, setSavedFilter] = useState(false);

  return (
    <AppBar position="static" sx={{ margin: "2.5vh 0 0" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            noWrap
            //component="a"
            //href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {name && `Hoş Geldin ${name}`}
          </Typography>

          <Box />
          <Box />
          <Box />

          <Typography
            noWrap
            sx={{
              display: "flex",
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            12/855
          </Typography>

          <Box sx={{ flexGrow: 0 }}>
            <IconButton
              onClick={({ currentTarget }) => console.log([currentTarget])}
              sx={{ p: 0, mr: "2vh" }}
            >
              <Tooltip title="Oluştur">
                <Avatar sx={{ bgcolor: green["A700"] }}>
                  <AddOutlined />
                </Avatar>
              </Tooltip>
            </IconButton>

            <IconButton
              onClick={({ currentTarget }) => setAnchorEl(currentTarget)}
              sx={{ p: 0 }}
            >
              <Tooltip title="Filtreler">
                <Avatar sx={{ bgcolor: green["A700"] }}>
                  <PageviewOutlined />
                </Avatar>
              </Tooltip>
            </IconButton>
            <Menu
              sx={{ mt: "45px" }}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem>
                <Button
                  sx={{ backgroundColor: "transparent !important" }}
                  startIcon={savedFilter && <Check />}
                  onClick={() => setSavedFilter(!savedFilter)}
                >
                  Kaydedilenler
                </Button>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
