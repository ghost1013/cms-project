import React, { useState, useEffect } from 'react'
import { withRouter, useHistory } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import Configre from '../../components/Configre/Configre'
import Select from '../../components/common/Select/Select'
import clsx from 'clsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './Review.scss'
import Icon from '../../components/common/Icon/Icon'
import queryString from 'query-string'
import {
  GenesisLogoImg,
  CommentSpeechIcon,
  CompareVersionLogoImg,
  HyundaiLogoImg,
  HomeDarkIcon,
  HomeLightIcon
} from '../../elements/icons/icons'
import ChatOutlinedIcon from '@material-ui/icons/ChatOutlined'
import SpeakerNotesOffOutlinedIcon from '@material-ui/icons/SpeakerNotesOffOutlined'
import RadioButtonUncheckedOutlinedIcon from '@material-ui/icons/RadioButtonUncheckedOutlined'
import CallMadeOutlinedIcon from '@material-ui/icons/CallMadeOutlined'
import StopOutlinedIcon from '@material-ui/icons/StopOutlined'
import {
  ARROW,
  CIRCLE,
  GENESIS,
  HYUNDAI,
  SONATA,
  SQUARE
} from '../../constants/constants'
import {
  fetchAllProjectsList,
  setSelectedProject
} from '../../features/projects/projectsSlice'
import AddCommentTool from '../../components/AddCommentTool/AddCommentTool'
import ModalDisplay from '../../components/common/Modal/Modal'
import { ANNOTATIION_MODAL_TEXT } from '../../constants/contentText'
import Button from '../../components/common/Button/Button'
import CameraRender from '../../components/CameraRender/CameraRender'
import { clickMenu, selectedMarket } from '../../features/canvas/canvasSlice'
import {
  fetchProjectComments,
  setShowComments
} from '../../features/ui/uiSlice'

const Review = ({ location }) => {
  const history = useHistory()
  const dispatch = useDispatch()

  const {
    slider: { data },
    configre: {
      cameraControls,
      showComments,
      selectedTrimValue,
      selectedExterior,
      selectedInterior
    },

    saveComments
  } = useSelector((state) => state.ui)

  const { selectedProject, allProjects } = useSelector(
    (state) => state.projects
  )

  const [versionData, setVersionData] = useState({})
  const [activeTool, setActiveTool] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [hideAnnotationToolBar, setHideAnnotationToolBar] = useState(true)

  const [document_title, setDoucmentTitle] = useDocumentTitle('Review Tool')

  const currentURL = window.location.hostname
  const url = process.env.REACT_APP_DEFAULT_DOMAIN_URL
  const { hostname: checkDefaultURL } = new URL(url)

  const {
    version,
    id: projectID,
    brand,
    name
  } = selectedProject || {
    version: '',
    id: '',
    brand: ''
  }
  const checkHyundaiBrand = brand === SONATA

  useEffect(() => {
    if (checkDefaultURL === currentURL && selectedProject === null) {
      const parsed = queryString.parse(location.search)

      const { brand, name, projectId, version } = parsed || {
        brand: null,
        name: null,
        projectId: null,
        version: null
      }

      if (brand && name && projectId && version) {
        const numberParsed = parseFloat(version)
        dispatch(
          setSelectedProject({
            brand,
            id: projectId,
            name,
            version: numberParsed
          })
        )
      } else {
        history.push('/projects')
      }
    } else {
      dispatch(fetchAllProjectsList())
    }
  }, [])

  useEffect(() => {
    if (
      allProjects &&
      allProjects.length > 0 &&
      checkDefaultURL !== currentURL &&
      selectedProject === null
    ) {
      const getProjectDetails = allProjects.find(
        ({ preview }) => preview.domain === currentURL
      )
      if (getProjectDetails) {
        const { brand, preview, created, id, name, version } =
          getProjectDetails || {}
        if (id) {
          const { annotation } = preview || { annotation: false }
          setHideAnnotationToolBar(annotation)
          dispatch(
            setSelectedProject({
              brand,
              created,
              id,
              name,
              version
            })
          )
        }
      } else {
        window.location.replace(`${url}/projects`)
      }
    }
  }, [allProjects, currentURL])

  useEffect(() => {
    selectedProject && fetchVersions()

    const { id: projectID } = selectedProject || {
      id: ''
    }
    if (projectID) {
      // This api to fetch Project Comments
      // dispatch(fetchProjectComments({ projectID }));
    }
  }, [selectedProject && selectedProject.id])

  const fetchVersions = async () => {
    try {
      const resp = await fetch(
        `${process.env.REACT_APP_CONFIG_URL}/v1/search/${process.env.REACT_APP_CONFIG_APP_ID}/configurations`
      )
      const data = await resp.json()
      // console.log(data.data[0].data);
      const versions = data.data[0].data.configurations.find(
        (version) => version.projectId === selectedProject.id
        // && version.id === selectedProject.version
      )

      setDoucmentTitle(versions.meta.title)
      setVersionData(versions)
    } catch (error) {
      console.log(error)
      history.push('/projects')
    }
  }

  const onToolClick = (toolType) => {
    if (toolType) {
      setActiveTool(toolType)
      setOpenModal(true)
    }
  }

  const onMenuClick = () => {
    history.push('/projects')
  }
  const cameraTitle =
    cameraControls &&
    cameraControls.data.filter((cam) => cam.value === cameraControls.value)

  const disableAnnotationTool =
    cameraTitle && cameraTitle[0]?.title.toLowerCase().includes('360')

  const onConfirmTool = () => {
    dispatch(clickMenu('ADD_MENU'))
    if (activeTool === ARROW) {
      dispatch(selectedMarket('ARROW_CONFIGRE'))
    }
    if (activeTool === SQUARE) {
      dispatch(selectedMarket('SQUARE_CONFIGRE'))
    }
    if (activeTool === CIRCLE) {
      dispatch(selectedMarket('CIRCE_CONFIGRE'))
    }
    setOpenModal(false)
  }

  const onCommentShowClick = () => {
    if (showComments) {
      dispatch(setShowComments(false))
      dispatch(clickMenu('HIDE_MENU'))
    } else {
      dispatch(setShowComments(true))
      dispatch(clickMenu('SHOW_MENU'))
    }
  }
  const filterComments =
    saveComments &&
    selectedTrimValue &&
    Array.isArray(saveComments) &&
    cameraControls &&
    saveComments.filter(
      ({
        versionId,
        projectId,
        fscId,
        interiorId,
        cameraControlId,
        exteriorColorId
      }) => {
        // console.log("fscId", selectedTrimValue.value, fscId);
        // console.log("projectId --- ", projectID, projectId);
        // console.log("versionId --- ", versionId);
        // console.log(
        //     "cameraControlId --- ",
        //     cameraControlId,
        //     cameraControls.value
        // );
        // console.log(
        //     "exteriorColorId --- ",
        //     exteriorColorId,
        //     selectedExterior
        // );
        // console.log("interiorId --- ", interiorId, selectedInterior);
        return (
          selectedTrimValue.value === fscId &&
          projectId === projectID &&
          versionId === version &&
          cameraControlId === cameraControls.value &&
          exteriorColorId === selectedExterior.value &&
          interiorId === selectedInterior.value
        )
      }
    )

  return (
    <div className='review'>
      <div className='review_home-icon' onClick={onMenuClick}>
        {checkHyundaiBrand ? <HomeDarkIcon /> : <HomeLightIcon />}
      </div>
      <div className={clsx(checkHyundaiBrand && 'lightTheme')}>
        <div className='brand-logo'>
          {brand === HYUNDAI && (
            <Icon
              className='brand-logo_hyundai_size'
              item={<HyundaiLogoImg />}
            />
          )}
          {brand === GENESIS && (
            <Icon
              className='brand-logo_genesis_size'
              item={<GenesisLogoImg />}
            />
          )}
        </div>

        <div className='review-layout'>
          <div className='config-tools'>
            {versionData?.configurations?.fscs && (
              <Configre
                checkHyundaiBrand={checkHyundaiBrand}
                configData={versionData.configurations}
                brand={brand}
                metaData={versionData.meta}
                productName={name}
                version={version}
              />
            )}
          </div>
          <div className='car-images'>
            {selectedProject && (
              <>
                <div
                  className={clsx(
                    'viewport_bar',
                    checkHyundaiBrand && 'viewport_bar-lightTheme'
                  )}
                >
                  <h4>Version: {version}</h4>

                  <div className='annotation-tools'>
                    <Icon
                      className='viewport_bar_icon-compare'
                      item={<CompareVersionLogoImg />}
                    />

                    {!disableAnnotationTool && (
                      <>
                        <AddCommentTool onToolClick={onToolClick} />
                        <div
                          className='viewport_bar_icon'
                          onClick={onCommentShowClick}
                        >
                          {showComments
                            ? (
                              <ChatOutlinedIcon />
                              )
                            : (
                              <SpeakerNotesOffOutlinedIcon />
                              )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className='viewport'>
                  <CameraRender
                    brand={brand}
                    data={data}
                    cameraControls={cameraControls}
                    filterComments={filterComments}
                    showComments={showComments}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ModalDisplay
        modalBody={
          <div className='review_body-text'>
            <div>{ANNOTATIION_MODAL_TEXT}</div>
            <div className='selected-icon'>
              {activeTool === ARROW && (
                <CallMadeOutlinedIcon style={{ fontSize: 60 }} />
              )}
              {activeTool === CIRCLE && (
                <RadioButtonUncheckedOutlinedIcon style={{ fontSize: 60 }} />
              )}
              {activeTool === SQUARE && (
                <StopOutlinedIcon style={{ fontSize: '4rem' }} />
              )}
            </div>

            <div className='next-wrapper'>
              <Button className='next-button' onClick={onConfirmTool}>
                Next
              </Button>
            </div>
          </div>
        }
        openModal={openModal}
        closeModal={() => setOpenModal(false)}
      />
    </div>
  )
}

export default withRouter(Review)
