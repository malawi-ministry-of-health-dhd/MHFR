import React from "react";
import styled from "styled-components";
import SearchTabs from "./FacilityFilter/SearchTabs";

function FacilityDirectorySidebar(props: Props) {
  const { dependancies, filterOptions, onAddFilter } = props;

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
    </SidebarStack>
  );
}

export default FacilityDirectorySidebar;

type Props = {
  dependancies: any;
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
