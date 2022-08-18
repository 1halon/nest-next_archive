import { Grid } from "@mui/material";
import type { NextPage } from "next";
import Navigation from "../src/components/Navigation";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import BillCard, { Props as BillCardProps } from "../src/components/BillCard";
import { useDispatch, useSelector } from "react-redux";
import { get } from "./api/cards";
import { cards } from "../src/reducers/billcard";
import { useEffect } from "react";

const Home: NextPage = ({ data, name }: any) => {
  const { cards: _cards } = useSelector((state: any) => state.billcard),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      cards({
        cards: data
      })
    );
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Navigation name={name} />
      <Grid
        container
        rowSpacing={1}
        columnSpacing={3}
        sx={{
          padding: "2.5vh",
          gridAutoColumns: "1fr",
          gridAutoFlow: "column",
        }}
      >
        {_cards.map((card, index) => (
          <Grid item key={index} sx={{ height: "fit-content" }}>
            <BillCard createdBy={name} {...card} />
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
