import { Box, useTheme } from "@mui/material";
import BitcoinChart from "../../components/BitcoinChart";
import Header from "../../components/Header";
import { tokens } from "../../theme";

const Bitcoin = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box m="20px">
      <Header title="Bitcoin" subtitle="Simple Bitcoin Chart" />

      <Box
        height="75vh"
        border={`1px solid ${colors.grey[100]}`}
        borderRadius="4px"
      >
        <BitcoinChart />
      </Box>
    </Box>
  );
};

export default Bitcoin;