// === GRAFICORESISTENCIAS.TSX ===

import React, { forwardRef } from "react";
import { BarChart } from "react-native-chart-kit";
import { Dimensions, View } from "react-native";

interface GraficoResistenciasProps {
  datos: number[];
}

const screenWidth = Dimensions.get("window").width;

const GraficoResistencias = forwardRef<View, GraficoResistenciasProps>(({ datos }, ref) => {
  const valores = datos.map(d => isNaN(d) ? 0 : d);
  const visibleBarCount = Math.max(valores.length, 5);
  const barArea = (screenWidth - 32) / visibleBarCount;

  return (
    <View ref={ref} collapsable={false} style={{ alignItems: 'center' }}>
      <BarChart
        data={{
          labels: valores.map((_, i) => `P${i + 1}`),
          datasets: [{ data: valores }]
        }}
        width={barArea * valores.length}
        height={240}
        fromZero
        yAxisLabel=""
        yAxisSuffix=""
        showValuesOnTopOfBars
        chartConfig={{
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: () => `#ff0000`,
          labelColor: () => `#333`,
          barPercentage: 1.0,
          style: { borderRadius: 16 },
          propsForBackgroundLines: {
            stroke: "#e3e3e3",
          },
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
        withHorizontalLabels
      />
    </View>
  );
});

export default GraficoResistencias;