import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Paper } from "@material-ui/core";
import LocationOnOutlined from "@material-ui/icons/LocationOnOutlined";
import ArrowForward from "@material-ui/icons/ArrowForward";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import EventAvailableOutlined from "@material-ui/icons/EventAvailableOutlined";
import WarningRounded from "@material-ui/icons/WarningRounded";
import VerifiedUserOutlined from "@material-ui/icons/VerifiedUserOutlined";
import MobileFacilityList from "../../molecules/FacilityMobileList";

function FacilityList(props: Props) {
  const { onSelect, className, data } = props;
  const [page, setPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    setPage(1);
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedFacilities = useMemo(
    () =>
      data.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize),
    [currentPage, data]
  );

  const paginationItems = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  return (
    <>
      <DesktopListShell className={`${className} hide-on-med-and-down`}>
        <DesktopGrid data-test="facilityDirectoryGrid">
          {pagedFacilities.length > 0 ? (
            pagedFacilities.map((facility: any) => {
              const isFunctional =
                String(facility.status || "").toLowerCase() === "functional";
              const footerText = isFunctional
                ? facility.dateOpened
                  ? `Opened ${facility.dateOpened}`
                  : facility.regulatoryStatus || "Operationally active"
                : facility.status || "Operational review needed";

              return (
                <FacilityCardButton
                  key={facility.id}
                  type="button"
                  data-test="facilityDirectoryCard"
                  onClick={() => onSelect(facility.id)}
                >
                  <FacilityCardChrome>
                    <FacilityCardBody>
                      <CardHeader>
                        <CodeTag>Code: {facility.code || "Not available"}</CodeTag>
                        <StatusTag $status={facility.status}>
                          <StatusDot $status={facility.status} />
                          <span>{facility.status || "Unknown"}</span>
                        </StatusTag>
                      </CardHeader>

                      <CardTitle>{facility.name || "Unnamed facility"}</CardTitle>
                      <CardLocation>
                        <LocationOnOutlined fontSize="small" />
                        <span>{facility.district || "District not available"}</span>
                      </CardLocation>

                      <InfoGrid>
                        <InfoCard>
                          <InfoLabel>Type</InfoLabel>
                          <InfoValue>{facility.type || "Not available"}</InfoValue>
                        </InfoCard>
                        <InfoCard>
                          <InfoLabel>Ownership</InfoLabel>
                          <InfoValue>
                            {facility.ownership || "Not available"}
                          </InfoValue>
                        </InfoCard>
                        <InfoCard>
                          <InfoLabel>Regulatory</InfoLabel>
                          <InfoValue>
                            {facility.regulatoryStatus || "Not available"}
                          </InfoValue>
                        </InfoCard>
                      </InfoGrid>

                      <CardFooter>
                        <FooterMeta $positive={isFunctional}>
                          {isFunctional ? (
                            facility.regulatoryStatus ? (
                              <VerifiedUserOutlined fontSize="small" />
                            ) : (
                              <EventAvailableOutlined fontSize="small" />
                            )
                          ) : (
                            <WarningRounded fontSize="small" />
                          )}
                          <span>{footerText}</span>
                        </FooterMeta>
                        <DetailLink>
                          View Details
                          <ArrowForward fontSize="small" />
                        </DetailLink>
                      </CardFooter>
                    </FacilityCardBody>
                  </FacilityCardChrome>
                </FacilityCardButton>
              );
            })
          ) : (
            <EmptyCard>
              <EmptyTitle>No facilities found</EmptyTitle>
              <EmptyCopy>
                Try broadening your filters or searching with a different facility
                name or code.
              </EmptyCopy>
            </EmptyCard>
          )}
        </DesktopGrid>
        {data.length > pageSize && (
          <PaginationBar>
            <PagerButton
              type="button"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft fontSize="small" />
            </PagerButton>
            {paginationItems.map((item, index) =>
              item === "..." ? (
                <PaginationDots key={`dots-${index}`}>...</PaginationDots>
              ) : (
                <PageButton
                  key={item}
                  type="button"
                  $active={currentPage === item}
                  onClick={() => setPage(Number(item))}
                >
                  {item}
                </PageButton>
              )
            )}
            <PagerButton
              type="button"
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight fontSize="small" />
            </PagerButton>
          </PaginationBar>
        )}
      </DesktopListShell>

      <MobilePaper className={`${className} hide-on-large-only`}>
        <MobileFacilityList
          data={data}
          onSelected={(facility: any) => onSelect(facility.id)}
        />
      </MobilePaper>
    </>
  );
}

export default FacilityList;

type Props = {
  onSelect: Function;
  data: Array<any>;
  className?: string;
};

const getStatusColors = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "functional":
      return {
        background: "rgba(0, 61, 53, 0.1)",
        color: "#003d35"
      };
    case "closed":
    case "closed (temporary)":
    case "non-functional":
      return {
        background: "#ffe8e5",
        color: "#c54b42"
      };
    default:
      return {
        background: "#edf1f5",
        color: "#5f6d80"
      };
  }
};

const DesktopGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
  }
`;

const DesktopListShell = styled.div`
  width: 100%;
`;

const FacilityCardButton = styled.button`
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
`;

const FacilityCardChrome = styled.div`
  height: 100%;
  padding: 1px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #eef2f7 100%);
  box-shadow: 0 14px 30px rgba(0, 49, 120, 0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  ${FacilityCardButton}:hover & {
    transform: translateY(-1px);
    box-shadow: 0 18px 36px rgba(0, 49, 120, 0.08);
  }
`;

const FacilityCardBody = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 18px 18px 16px;
  border-radius: 23px;
  background: #ffffff;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
`;

const CodeTag = styled.div`
  padding: 8px 10px;
  border-radius: 10px;
  background: #f3f6fa;
  color: #6b82a6;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  line-height: 1;
  text-transform: uppercase;
`;

const StatusTag = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  background: ${props => getStatusColors(props.$status).background};
  color: ${props => getStatusColors(props.$status).color};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
`;

const StatusDot = styled.span<{ $status: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => getStatusColors(props.$status).color};
`;

const CardTitle = styled.h3`
  margin: 0 0 8px;
  color: #003178;
  font-family: "Public Sans", "Roboto", sans-serif;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.03em;
`;

const CardLocation = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  color: #606b7b;
  font-size: 13px;
  line-height: 1.45;

  svg {
    color: #48596f;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: auto;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  padding: 13px 11px;
  border-radius: 14px;
  background: #f6f6f7;
`;

const InfoLabel = styled.div`
  margin-bottom: 5px;
  color: #9298a4;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
`;

const InfoValue = styled.div`
  color: #20262e;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #eef1f4;
`;

const FooterMeta = styled.div<{ $positive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${props => (props.$positive ? "#0b665a" : "#c54b42")};
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
`;

const DetailLink = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #003178;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
  transition: gap 0.18s ease;

  ${FacilityCardButton}:hover & {
    gap: 8px;
  }
`;

const EmptyCard = styled.div`
  grid-column: 1 / -1;
  padding: 40px 32px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(0, 49, 120, 0.05);
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px;
  color: #183150;
  font-size: 22px;
  font-weight: 800;
`;

const EmptyCopy = styled.p`
  margin: 0;
  color: #66768a;
  font-size: 14px;
  line-height: 1.65;
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 26px;
`;

const PagerButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 11px;
  background: #edf0f4;
  color: #5d7596;
  box-shadow: inset 0 0 0 1px rgba(209, 217, 228, 0.72);
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

const PageButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border: 0;
  border-radius: 11px;
  background: ${props => (props.$active ? "#003178" : "#ffffff")};
  color: ${props => (props.$active ? "#ffffff" : "#5f6f86")};
  font-size: 14px;
  font-weight: 800;
  box-shadow: ${props =>
    props.$active
      ? "0 14px 26px rgba(0, 49, 120, 0.18)"
      : "inset 0 0 0 1px rgba(228, 233, 240, 0.95)"};
  cursor: pointer;
`;

const PaginationDots = styled.span`
  color: #8b95a4;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
`;

const MobilePaper = styled(Paper)`
  width: 100%;
  padding: 16px 14px 20px;
  border-radius: 24px !important;
  background: #ffffff !important;
  box-shadow: 0 14px 30px rgba(0, 49, 120, 0.06) !important;
`;
