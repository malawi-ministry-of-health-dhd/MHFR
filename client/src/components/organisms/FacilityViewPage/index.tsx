import React from "react";
import { Grid } from "@material-ui/core";
import Title from "../../molecules/PageTitle";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHospital,
  faEdit,
  faTrash,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import Container from "../../atoms/Container";
import OptionsBar from "../../molecules/FacilityViewOptionsBar";
import Card from "../../atoms/Card";
import FacilityGoogleMap from "../../molecules/FacilityGoogleMap";
import BasicDetailsPage from "../../molecules/FacilityBasicDetails";
import ContactsPage from "../../molecules/FacilityContacts";
import ResourcesPage from "../../molecules/FacilityResources";
import UtilitiesPage from "../../molecules/FacilityUtilities";
import ServicesPage from "../../molecules/FacilityServices";
import styled from "styled-components";
import { FacilityPages } from "../../../services/utils";
import Button from "../../atoms/Button";
import { Link } from "react-router-dom";
import { isLoggedIn, getUser } from "../../../services/helpers";
import EmptyState from "../../atoms/FacilityDetailsEmptyState";
import Ac from "../../atoms/Ac";
import { acActions } from "../../../acl";
import { IFacilityCurrent } from "../../../services/types";

library.add(faHospital, faEdit);

function FacilityViewPage(props: Props) {
  const {
    basic,
    resources,
    utilities,
    services,
    pageHeader,
    activePage,
    downloadFacility,
    badge,
  } = props;
  const [detailsCollapsed, setDetailsCollapsed] = React.useState(false);
  const detailsPanelRef = React.useRef<HTMLDivElement | null>(null);
  const [detailsPanelWidth, setDetailsPanelWidth] = React.useState(0);

  React.useEffect(() => {
    const updateDetailsPanelWidth = () => {
      setDetailsPanelWidth(detailsPanelRef.current?.offsetWidth || 0);
    };

    updateDetailsPanelWidth();
    window.addEventListener("resize", updateDetailsPanelWidth);

    return () => {
      window.removeEventListener("resize", updateDetailsPanelWidth);
    };
  }, [activePage, detailsCollapsed]);

  const position =
    basic.geolocations && basic.geolocations.latitude != ""
      ? {
          lat: parseFloat(basic.geolocations.latitude),
          lng: parseFloat(basic.geolocations.longitude),
        }
      : { lat: -13.9626121, lng: 33.7741195 };
  const acAction =
    activePage == FacilityPages.summary
      ? "basic_details"
      : activePage == FacilityPages.contact
        ? "contact_location_details"
        : activePage;
  return (
    <Container style={{ padding: "16px" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} md={12}>
          <Title
            title={basic.facility_name || ""}
            sub={basic.common_name ? basic.common_name : ""}
            approved={
              basic.registration_number != null &&
              basic.registration_number.length > 0
            }
            icon={<FontAwesomeIcon icon={faHospital} />}
            options={
              <Ac
                role={getUser().role}
                action="facility:basic_details:create"
                allowed={() => (
                  <>
                    {/* <Link to="/facilities/add">
                      <Button icon={<FontAwesomeIcon icon={faPlusCircle} />}>
                        Add Facility
                      </Button>
                    </Link> */}
                    <Button
                      icon={<FontAwesomeIcon icon={faTrash} />}
                      theme="danger"
                      onClick={props.archiveFacility}
                    >
                      Archive Facility
                    </Button>
                  </>
                )}
              />
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <Card>
            <OptionsBar
              facility={basic}
              downloadFacility={downloadFacility}
              badge={badge}
            />
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <MapStage>
            <FacilityGoogleMap
              position={position}
              isMarkerShown
              rightInset={detailsPanelWidth}
            />
            <DetailsContainer>
              <DetailsPanel ref={detailsPanelRef}>
                <Card
                  heading={
                    <CardTitle>
                      <div>{pageHeader}</div>
                      <CardActions>
                        {isLoggedIn() && (
                          <Ac
                            role={getUser().role}
                            action={`facility:${acAction}:update` as acActions}
                            allowed={() => (
                              <Link
                                to={`/facilities/${basic.id}/${activePage}/edit`}
                              >
                                <Button
                                  theme="secondary"
                                  icon={
                                    <FontAwesomeIcon
                                      icon={faEdit}
                                      data-test="facilityUpdateButton"
                                    />
                                  }
                                >
                                  Update Facility
                                </Button>
                              </Link>
                            )}
                          />
                        )}
                        <CollapseButton
                          type="button"
                          aria-expanded={!detailsCollapsed}
                          aria-label={
                            detailsCollapsed
                              ? "Show facility details"
                              : "Hide facility details"
                          }
                          data-test="toggleFacilityDetails"
                          onClick={() => setDetailsCollapsed(!detailsCollapsed)}
                        >
                          <FontAwesomeIcon
                            icon={
                              detailsCollapsed ? faChevronDown : faChevronUp
                            }
                          />
                          {detailsCollapsed ? "Show details" : "Hide details"}
                        </CollapseButton>
                      </CardActions>
                    </CardTitle>
                  }
                  style={{ position: "relative", pointerEvents: "auto" }}
                  bodyStyle={
                    detailsCollapsed
                      ? { padding: "0px", marginBottom: 0 }
                      : { padding: "20px" }
                  }
                >
                  <CollapsibleContent
                    style={{
                      maxHeight: detailsCollapsed ? "0px" : "35vh",
                      opacity: detailsCollapsed ? 0 : 1,
                      pointerEvents: detailsCollapsed ? "none" : "auto",
                    }}
                  >
                    <FacilityPage>
                      {activePage == FacilityPages.summary && (
                        <BasicDetailsPage facility={basic} />
                      )}
                      {activePage == FacilityPages.contact && (
                        <ContactsPage facility={basic} />
                      )}
                      {activePage == FacilityPages.resources &&
                        (resources.length == 0 ? (
                          <EmptyState resource="resources" />
                        ) : (
                          <ResourcesPage resources={resources} />
                        ))}
                      {activePage == FacilityPages.utilities &&
                        (utilities.length == 0 ? (
                          <EmptyState resource="utilities" />
                        ) : (
                          <UtilitiesPage utilities={utilities} />
                        ))}
                      {activePage == FacilityPages.services &&
                        (services.length == 0 ? (
                          <EmptyState resource="services" />
                        ) : (
                          <ServicesPage services={services} />
                        ))}
                    </FacilityPage>
                  </CollapsibleContent>
                </Card>
              </DetailsPanel>
            </DetailsContainer>
          </MapStage>
        </Grid>
      </Grid>
    </Container>
  );
}

type Props = {
  archiveFacility: Function;
  activePage: string;
  pageHeader: string;
  basic: IFacilityCurrent;
  resources: Array<any>;
  services: Array<any>;
  utilities: Array<any>;
  onEditDetails: Function;
  downloadFacility: Function;
  badge: any;
};
export default FacilityViewPage;

const MapStage = styled.div`
  position: relative;
  height: 57vh;
`;

const DetailsContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 600;
  pointer-events: none;
`;

const DetailsPanel = styled.div`
  width: 100%;
  max-width: 600px;
`;

const FacilityPage = styled.div`
  min-height: 25vh;
  max-height: 35vh;
  overflow: scroll;
`;

const CollapsibleContent = styled.div`
  overflow: hidden;
  transition:
    max-height 0.24s ease,
    opacity 0.2s ease;
`;

const CardTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
`;

const CollapseButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.56);
  }
`;
