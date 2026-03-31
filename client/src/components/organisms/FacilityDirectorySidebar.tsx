import React from "react";
import styled from "styled-components";
import FavoriteBorderOutlined from "@material-ui/icons/FavoriteBorderOutlined";
import SearchTabs from "./FacilityFilter/SearchTabs";

function FacilityDirectorySidebar(props: Props) {
  const { dependancies, totalFacilitiesCount, filterOptions, onAddFilter } = props;
  const districts = dependancies?.districts?.list || [];

  return (
    <SidebarStack>
      <FilterPanel>
        <SidebarTitle>Filter Registry</SidebarTitle>
        <TabsShell>
          <SearchTabs
            dependancies={dependancies}
            filterOptions={filterOptions}
            onAddFilter={onAddFilter}
          />
        </TabsShell>
      </FilterPanel>

      <StatsCard>
        <StatsEyebrow>Live Statistics</StatsEyebrow>
        <StatsValue>{totalFacilitiesCount.toLocaleString()}</StatsValue>
        <StatsCopy>
          Total verified health facilities across {districts.length} districts in
          Malawi.
        </StatsCopy>
        <StatsIconWrap>
          <FavoriteBorderOutlined fontSize="inherit" />
        </StatsIconWrap>
      </StatsCard>
    </SidebarStack>
  );
}

export default FacilityDirectorySidebar;

type Props = {
  dependancies: any;
  totalFacilitiesCount: number;
  filterOptions: Array<any>;
  onAddFilter: Function;
};

const SidebarStack = styled.div`
  position: sticky;
  top: 102px;
`;

const FilterPanel = styled.div`
  padding: 22px 0 18px;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 14px 32px rgba(0, 49, 120, 0.04);
  overflow: hidden;
`;

const SidebarTitle = styled.h2`
  margin: 0 18px 18px;
  color: #003178;
  font-family: "Public Sans", "Roboto", sans-serif;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

const TabsShell = styled.div`
  .MuiTabs-root {
    background: #ffffff;
  }
`;

const StatsCard = styled.div`
  position: relative;
  margin-top: 18px;
  padding: 20px 18px 22px;
  border-radius: 22px;
  background: linear-gradient(145deg, #075d50 0%, #0b6f61 100%);
  color: #dff6f1;
  overflow: hidden;
`;

const StatsEyebrow = styled.div`
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  line-height: 1;
  text-transform: uppercase;
  opacity: 0.8;
`;

const StatsValue = styled.div`
  margin-bottom: 10px;
  font-family: "Public Sans", "Roboto", sans-serif;
  font-size: 40px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
`;

const StatsCopy = styled.p`
  max-width: 230px;
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
`;

const StatsIconWrap = styled.div`
  position: absolute;
  right: -6px;
  bottom: -8px;
  color: rgba(223, 246, 241, 0.12);
  font-size: 96px;
`;
