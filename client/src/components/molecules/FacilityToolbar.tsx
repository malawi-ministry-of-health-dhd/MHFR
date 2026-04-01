// @ts-nocheck
import React from "react";
import styled, { css } from "styled-components";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ViewModuleOutlined from "@material-ui/icons/ViewModuleOutlined";
import TableChartOutlined from "@material-ui/icons/TableChartOutlined";
import {
  faPlus,
  faPrint,
  faDownload
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { isLoggedIn, getUser } from "../../services/helpers";
import Ac from "../atoms/Ac";

library.add(faPlus, faPrint, faDownload);

function FacilityToolbar(props: Props) {
  const { downloadList, facilityIds, viewMode, onViewModeChange } = props;

  return (
    <ActionsGroup>
      <LayoutToggle data-test="facilityLayoutToggle">
        <LayoutToggleButton
          type="button"
          $active={viewMode === "cards"}
          onClick={() => onViewModeChange("cards")}
        >
          <ViewModuleOutlined fontSize="small" />
          <span>Cards</span>
        </LayoutToggleButton>
        <LayoutToggleButton
          type="button"
          $active={viewMode === "table"}
          onClick={() => onViewModeChange("table")}
        >
          <TableChartOutlined fontSize="small" />
          <span>Table</span>
        </LayoutToggleButton>
      </LayoutToggle>
      <ActionButton
        type="button"
        tone="surface"
        onClick={() => downloadList("csv", facilityIds)}
        data-test="downloadExcelBtn"
      >
        <ActionIcon>
          <FontAwesomeIcon icon={faDownload} />
        </ActionIcon>
        <span>Export CSV</span>
      </ActionButton>
      <ActionButton
        type="button"
        tone="surface"
        onClick={() => downloadList("pdf", facilityIds)}
        data-test="downloadPdfBtn"
      >
        <ActionIcon>
          <FontAwesomeIcon icon={faPrint} />
        </ActionIcon>
        <span>Download PDF</span>
      </ActionButton>
      {isLoggedIn() && (
        <Ac
          role={getUser().role}
          action="facility:basic_details:create"
          allowed={() => (
            <ActionLink to="/facilities/add" tone="primary" data-test="addFacilityBtn">
              <ActionIcon>
                <FontAwesomeIcon icon={faPlus} />
              </ActionIcon>
              <span>Add Facility</span>
            </ActionLink>
          )}
        />
      )}
    </ActionsGroup>
  );
}

type Props = {
  downloadList: Function;
  facilityIds?: Array<number>;
  viewMode: "cards" | "table";
  onViewModeChange: (mode: "cards" | "table") => void;
};

export default FacilityToolbar;

const actionToneStyles = {
  surface: css`
    background: #edf0f4;
    color: #486487;
    box-shadow: inset 0 0 0 1px rgba(204, 213, 225, 0.65);

    &:hover {
      background: #e6ebf2;
    }
  `,
  primary: css`
    background: linear-gradient(135deg, #003178 0%, #0d47a1 100%);
    color: #ffffff;
    box-shadow: 0 14px 28px rgba(0, 49, 120, 0.18);

    &:hover {
      background: linear-gradient(135deg, #002a68 0%, #083c8a 100%);
    }
  `
};

const actionBaseStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease,
    background-color 0.18s ease;
  ${(props: any) => actionToneStyles[props.tone || "surface"]};

  &:hover {
    transform: translateY(-1px);
  }
`;

const ActionsGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;

  @media (max-width: 992px) {
    width: 100%;
  }
`;

const LayoutToggle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 14px;
  background: #edf0f4;
  box-shadow: inset 0 0 0 1px rgba(204, 213, 225, 0.75);
`;

const LayoutToggleButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 10px;
  background: ${props => (props.$active ? "#ffffff" : "transparent")};
  color: ${props => (props.$active ? "#003178" : "#607089")};
  box-shadow: ${props =>
    props.$active ? "0 8px 16px rgba(0, 49, 120, 0.08)" : "none"};
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease,
    box-shadow 0.18s ease;
`;

const ActionButton = styled.button`
  ${actionBaseStyles};
  cursor: pointer;
`;

const ActionLink = styled(Link)`
  ${actionBaseStyles};
`;

const ActionIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`;
