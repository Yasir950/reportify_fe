import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const { pro, dis, teh, cities } = await getOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Pakistan Provinces"
        data={{
          ...pro,
          value: compactFormat(pro.value),
        }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Total Districts"
        data={{
          ...dis,
          value:  compactFormat(dis.value),
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Total Tehsils"
        data={{
          ...teh,
          value: compactFormat(teh.value),
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Total Cities"
        data={{
          ...cities,
          value: compactFormat(cities.value),
        }}
        Icon={icons.Users}
      />
    </div>
  );
}
