import { Grid } from "@mui/material";
import type { NextPage } from "next";
import Navigation from "../src/components/Navigation";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import BillCard, { Props as BillCardProps } from "../src/components/BillCard";

const Home: NextPage = ({ name }: any) => {
  let cards = [
    <BillCard
      date={Date.now()}
      description="Description"
      editable={true}
      receipt="https://ogmmateryal.eba.gov.tr/panel/upload/pdf/dtp0hwksxlx.pdf"
      type="AİDAT"
    />,
  ];

  const addCard = (props: BillCardProps) =>
    cards.push(
      <BillCard
        date={props.date}
        description={props.description}
        editable={props.editable}
        id={props.id}
        receipt={props.receipt}
        saved={props.saved}
        type={props.type}
      />
    );

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Navigation name={name} />
      <Grid container spacing={2} sx={{ padding: "2.5vh" }}>
        {cards.map((card, index) => (
          <Grid item key={index}>
            {card}
          </Grid>
        ))}
      </Grid>
    </LocalizationProvider>
  );
};

export default Home;
