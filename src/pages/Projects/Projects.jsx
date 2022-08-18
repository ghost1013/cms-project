import React, { useEffect } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader/PageHeader'
import Table from '../../components/common/Table/Table'
import {
  fetchAllProjectsList,
  fetchLatestVersion,
  setSelectedProject,
  updateProjectList
} from '../../features/projects/projectsSlice'
import { columnsProject } from './ProjectColumns'
import './Projects.scss'
import { COLUMN_LATEST_VERSION, COLUMN_LIVE } from 'constants/constants'

const Projects = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { allProjects, loadingAllProjects } = useSelector(
    (state) => state.projects
  )

  useEffect(() => {
    dispatch(fetchAllProjectsList())
  }, [])

  const handleClickRowProject = (e, columnName, itemRow) => {
    if (columnName === COLUMN_LIVE) {
      const {
        brand,
        created,
        id,
        name,
        live: { assetsVersion }
      } = itemRow
      const projectData = {
        brand,
        created,
        id,
        name,
        version: assetsVersion
      }

      dispatch(setSelectedProject(projectData))
      // localStorage.setItem("project", JSON.stringify(projectData));
      history.push(
        `/review?name=${name}&brand=${brand}&mode=live&version=${assetsVersion}&projectId=${id}`
      )
    } else if (columnName === COLUMN_LATEST_VERSION) {
      const { brand, created, id, name, latestVersion } = itemRow
      if (latestVersion) {
        const projectData = {
          brand,
          created,
          id,
          name,
          version: latestVersion
        }
        dispatch(setSelectedProject(projectData))
        history.push(
          `/review?name=${name}&brand=${brand}&mode=preview&version=${latestVersion}&projectId=${id}`
        )
      }
    }
  }

  useEffect(() => {
    async function getLatestVersion () {
      const results = await Promise.all(
        allProjects.map(async ({ name }) => {
          const version = await fetchLatestVersion(name)
          return { projectName: name, version }
        })
      )
      if (results && results.length > 0) {
        const updatedList = []
        allProjects.forEach((item) => {
          const getVersion = results.find(
            ({ projectName }) => projectName === item.name
          )
          updatedList.push({ ...item, latestVersion: getVersion.version })
        })
        dispatch(updateProjectList(updatedList))
      }
    }
    getLatestVersion()
  }, [allProjects])

  return (
    <>
      <PageHeader />
      {loadingAllProjects
        ? (
          <div className='projects'>
            <Table
              className='dashboard_tableProjects'
              columns={columnsProject}
              dataSource={allProjects || []}
              onAction={handleClickRowProject}
              hover
              hoverClickDisableAtRow={{
                columnName: 'live.status',
                value: 'development'
              }}
            />
          </div>
          )
        : (
          <div className='projects-loader'>
            <CircularProgress />
          </div>
          )}
    </>
  )
}

export default Projects
