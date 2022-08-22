import { Grid } from "@mui/material";
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
import { set } from "../src/reducers/user";

const BillCard = dynamic(() => import("../src/components/BillCard"), {
  ssr: false,
  suspense: true,
});

const Home: NextPage = ({ data }: any) => {
  const { cards: _cards } = useSelector((state: any) => state.billcard),
    { username } = useSelector((state: any) => state.user),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(cards(data));
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let session_name = sessionStorage.getItem("name");
    if (!session_name) session_name = prompt("Kimsin?");
    if (typeof session_name !== "string" || session_name.trim().length === 0)
      return location.reload();
    dispatch(set(session_name));
    sessionStorage.setItem("name", session_name);
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Navigation />

      <Grid
        container
        rowSpacing={1}
        columnSpacing={3}
        sx={{
          padding: "2.5vh",
        }}
      >
        {_cards.map((card, index) => (
          <Grid item key={index} sx={{ height: "fit-content" }}>
            <Suspense fallback={<BillCardSkeleton />}>
              <BillCard {...card} />
            </Suspense>
          </Grid>
        ))}
      </Grid>
    </LocalizationProvider>
  );
};

export async function getServerSideProps() {
  return { props: { data: await get() } };
}

export default Home;
