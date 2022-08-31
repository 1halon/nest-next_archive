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
  Skeleton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  blue,
  common,
  deepOrange,
  green,
  grey,
  lightBlue,
} from "@mui/material/colors";
import { AddOutlined, Check, PageviewOutlined } from "@mui/icons-material";
import { useState } from "react";
import { add } from "../reducers/billcard";
import { useDispatch, useSelector } from "react-redux";

const Navigation = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null),
    [savedFilter, setSavedFilter] = useState(false);

  const { cards, counts } = useSelector((state: any) => state.billcard),
    { username } = useSelector((state: any) => state.user),
    dispatch = useDispatch();

  if (!username) return <NavigationSkeleton />;

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
            {`Hoş Geldin ${username}`}
          </Typography>

          <Typography
            noWrap
            sx={{
              display: "flex",
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              ml: "auto",
              pr: "1rem",
            }}
          >
            {counts.filtered}/{counts.total}
          </Typography>

          <Box sx={{ flexGrow: 0 }}>
            <IconButton
              disabled={Boolean(cards.find((card) => !card.id))}
              onClick={() =>
                dispatch(add({ createdBy: username, editable: true }))
              }
              sx={{ p: 0, mr: "2vh" }}
            >
              <Tooltip title="Oluştur">
                <Avatar sx={{ color: "text.primary", bgcolor: common.black }}>
                  <AddOutlined />
                </Avatar>
              </Tooltip>
            </IconButton>

            <IconButton
              disabled
              onClick={({ currentTarget }) => setAnchorEl(currentTarget)}
              sx={{ p: 0 }}
            >
              <Tooltip title="Filtreler">
                <Avatar sx={{ color: "text.primary", bgcolor: common.black }}>
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

export const NavigationSkeleton = () => {
  return (
    <Skeleton
      sx={{ margin: "2.5vh 0 0" }}
      animation="wave"
      variant="rectangular"
      width="100%"
      height="64px"
    />
  );
};
export default Navigation;
