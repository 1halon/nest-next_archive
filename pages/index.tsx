import { Alert, AlertTitle, Grid, Slide, Snackbar } from "@mui/material";
import type { NextPage } from "next";
import Navigation from "../src/components/Navigation";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { BillCardSkeleton } from "../src/components/BillCard";
import { useDispatch, useSelector } from "react-redux";
import { get } from "./api/cards";
import { cards } from "../src/reducers/billcard";
import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { alert as _alert, username } from "../src/reducers/user";
import type { SelectorState } from "../src/reducers";

const Home: NextPage = () => {
  const { cards: _cards } = useSelector<
      SelectorState,
      SelectorState["billcard"]
    >((state) => state.billcard),
    { alert } = useSelector<SelectorState, SelectorState["user"]>(
      (state) => state.user
    ),
    dispatch = useDispatch();

  useEffect(() => {
    let session_name = sessionStorage.getItem("name");
    if (!session_name) session_name = prompt("Kimsin?");
    if (typeof session_name !== "string" || session_name.trim().length === 0)
      return location.reload();
    dispatch(username(session_name));
    sessionStorage.setItem("name", session_name);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const BillCard = dynamic(() => import("../src/components/BillCard"), {
    ssr: false,
    suspense: true,
  });

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="tr">
      <Navigation />

      <Grid
        container
        rowSpacing={1}
        columnSpacing={3}
        sx={{
          padding: "2.5vh",
        }}
      >
        {_cards
          .sort((a, b) => b.date - a.date)
          .map((card, index) => (
            <Grid item key={index} sx={{ height: "fit-content" }}>
              <Suspense fallback={<BillCardSkeleton />}>
                <BillCard {...card} />
              </Suspense>
            </Grid>
          ))}
      </Grid>
      <Snackbar
        autoHideDuration={alert?.timeout ?? 5000}
        open={alert?.open}
        onClose={() => dispatch(_alert({ ...alert, open: false }))}
      >
        <Alert
          severity={alert?.severity ?? "error"}
          variant="filled"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            margin: "1.5vh",
            width: "max-content",
          }}
        >
          {alert?.title && (
            <AlertTitle>
              <strong>{alert.title}</strong>
            </AlertTitle>
          )}
          {alert?.content}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default Home;
