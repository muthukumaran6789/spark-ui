import { useEffect, useMemo, useState } from 'react'
import visteonLogo from './assets/visteon-logo.jpg'
import './spark.css'

const testimonials = [
  { quote: 'I landed my first product design role just three weeks after graduating. Spark made the whole process feel less overwhelming.', name: 'Aisha Nair', role: 'Product Designer at Linear', initials: 'AN', color: 'avatar-peach' },
  { quote: 'The roles here are actually made for people starting out. I found a team that cared more about how I think than my years of experience.', name: 'Rohan Mehta', role: 'Software Engineer at Razorpay', initials: 'RM', color: 'avatar-blue' },
  { quote: 'We met our newest analyst on Spark. Thoughtful applicants, a simple process, and a much better way to find early career talent.', name: 'Meera Shah', role: 'People Partner at Groww', initials: 'MS', color: 'avatar-green' },
]

function Arrow({ diagonal = false }) {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="arrow-icon"><path d={diagonal ? 'M5 15 15 5M6 5h9v9' : 'M4 10h11m-4-4 4 4-4 4'} /></svg>
}

function Brand({ onClick }) {
  return <button className="brand" onClick={onClick} aria-label="Spark home"><img src={visteonLogo} alt="Visteon" /><span className="brand-name">spark</span></button>
}

function clearAuthStorage() {
  for (const key of ['sparkAccessToken', 'sparkRefreshToken', 'sparkTokenType', 'sparkExpiresAt']) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }
}

async function fetchCurrentUser(accessToken, tokenType = 'Bearer') {
  const response = await fetch('http://localhost:3000/api/user', {
    headers: { Authorization: `${tokenType} ${accessToken}` },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Could not load your account details.')
    error.status = response.status
    throw error
  }
  return data
}

async function fetchProjects() {
  const accessToken = localStorage.getItem('sparkAccessToken')
  const tokenType = localStorage.getItem('sparkTokenType') || 'Bearer'
  const response = await fetch('http://localhost:3000/api/projects', {
    headers: accessToken ? { Authorization: `${tokenType} ${accessToken}` } : {},
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Could not load projects. Please try again.')
    error.status = response.status
    throw error
  }
  if (!Array.isArray(data)) throw new Error('The projects service returned an unexpected response.')
  return data
}

async function fetchMyProjects() {
  const accessToken = localStorage.getItem('sparkAccessToken')
  const tokenType = localStorage.getItem('sparkTokenType') || 'Bearer'
  const response = await fetch('http://localhost:3000/api/projects/mine', {
    headers: accessToken ? { Authorization: `${tokenType} ${accessToken}` } : {},
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Could not load your projects. Please try again.')
    error.status = response.status
    throw error
  }
  if (Array.isArray(data)) return data
  if (Array.isArray(data.projects)) return data.projects
  throw new Error('The projects service returned an unexpected response.')
}

async function fetchAllUsers() {
  const accessToken = localStorage.getItem('sparkAccessToken')
  const tokenType = localStorage.getItem('sparkTokenType') || 'Bearer'
  const response = await fetch('http://localhost:3000/api/users/all', {
    headers: accessToken ? { Authorization: `${tokenType} ${accessToken}` } : {},
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Could not load users. Please try again.')
    error.status = response.status
    throw error
  }
  if (!Array.isArray(data)) throw new Error('The users service returned an unexpected response.')
  return data
}

async function fetchMyApplications() {
  const accessToken = localStorage.getItem('sparkAccessToken')
  const tokenType = localStorage.getItem('sparkTokenType') || 'Bearer'
  const response = await fetch('http://localhost:3000/api/applications/me', {
    headers: accessToken ? { Authorization: `${tokenType} ${accessToken}` } : {},
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Could not load your applications. Please try again.')
    error.status = response.status
    throw error
  }
  if (!Array.isArray(data)) throw new Error('The applications service returned an unexpected response.')
  return data
}

function ProjectCard({ project, onApply, isApplying, isApplied, showApply = true, showApplicants = false, onViewApplicants }) {
  const managerName = project.manager?.displayName || 'Manager details unavailable'
  const createdDate = project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable'
  const hasApplied = project.hasApplied === true || isApplied
  return <article className="project-card">
    <div className="project-card-top"><span className="project-symbol">✳</span><span className={`project-status ${String(project.status || 'unknown').toLowerCase()}`}>{project.status || 'Status unavailable'}</span></div>
    <span className="project-name">{project.projectName || 'SPARK PROJECT'}</span>
    <h3>{project.title || 'Untitled project'}</h3>
    <p className="project-description">{typeof project.description === 'string' && project.description.trim() ? project.description : 'Project description coming soon.'}</p>
    <div className="project-details"><div><span>Duration</span><b>{project.duration || 'To be confirmed'}</b></div><div><span>Project manager</span><b>{managerName}</b></div><div><span>Posted</span><b>{createdDate}</b></div></div>
    {showApply && (hasApplied ? <span className="project-applied">✓ Applied</span> : <button className="button button-teal project-apply" onClick={() => onApply(project)} disabled={isApplying}>{isApplying ? 'Applying…' : 'Apply Now'} {!isApplying && <Arrow />}</button>)}
    {showApplicants && <button className="project-applicants-link" onClick={() => onViewApplicants(project)}>View applicants <Arrow /></button>}
  </article>
}

function MyApplicationCard({ application, project }) {
  const appliedDate = application.appliedAt ? new Date(application.appliedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Date unavailable'
  return <article className="my-application-card">
    <div className="my-application-heading"><div><span className="section-kicker">{project?.projectName || 'SPARK PROJECT'}</span><h2>{project?.title || `Project ${application.projectId || ''}`}</h2></div><span className={`application-status ${String(application.status || 'submitted').toLowerCase()}`}>{application.status || 'submitted'}</span></div>
    {project?.description && <p className="my-application-description">{project.description}</p>}
    <div className="my-application-message"><span>Your message</span><p>{application.message || 'No message provided.'}</p></div>
    <div className="my-application-footer"><span>Applied {appliedDate}</span><span>Project ID: {application.projectId || 'Unavailable'}</span></div>
  </article>
}

function ApplicantCard({ application, onChangeStatus, isUpdating }) {
  const status = String(application.status || 'submitted').toLowerCase()
  const appliedDate = application.appliedAt ? new Date(application.appliedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Date unavailable'
  return <article className="applicant-card"><div className="applicant-top"><div className="applicant-avatar">{(application.applicant?.displayName || 'A').slice(0, 1).toUpperCase()}</div><div className="applicant-identity"><b>{application.applicant?.displayName || 'Applicant'}</b><span>{application.applicant?.email || 'Email unavailable'}</span></div><span className={`application-status ${status}`}>{application.status || 'submitted'}</span></div><p className="applicant-message">{application.message || 'No message provided.'}</p><span className="applicant-date">Applied {appliedDate}</span>{status === 'submitted' && <div className="applicant-actions"><button className="application-action select" onClick={() => onChangeStatus(application, 'selected')} disabled={isUpdating}>{isUpdating ? 'Updating…' : 'Select'}</button><button className="application-action reject" onClick={() => onChangeStatus(application, 'rejected')} disabled={isUpdating}>Reject</button></div>}</article>
}

function App() {
  const [page, setPage] = useState('home')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All projects')
  const [toast, setToast] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [myProjects, setMyProjects] = useState([])
  const [myProjectsLoading, setMyProjectsLoading] = useState(false)
  const [myProjectsError, setMyProjectsError] = useState('')
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [usersRefresh, setUsersRefresh] = useState(0)
  const [newUser, setNewUser] = useState({ email: '', displayName: '', password: '', role: 'applicant' })
  const [creatingUser, setCreatingUser] = useState(false)
  const [createUserError, setCreateUserError] = useState('')
  const [myApplications, setMyApplications] = useState([])
  const [myApplicationsLoading, setMyApplicationsLoading] = useState(false)
  const [myApplicationsError, setMyApplicationsError] = useState('')
  const [applicationsRefresh, setApplicationsRefresh] = useState(0)
  const [applicantsProject, setApplicantsProject] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [applicantsLoading, setApplicantsLoading] = useState(false)
  const [applicantsError, setApplicantsError] = useState('')
  const [updatingApplicationUserId, setUpdatingApplicationUserId] = useState('')
  const [projectRefresh, setProjectRefresh] = useState(0)
  const [projectSubmitting, setProjectSubmitting] = useState(false)
  const [projectSubmitError, setProjectSubmitError] = useState('')
  const [applyingProjectId, setApplyingProjectId] = useState('')
  const [appliedProjectIds, setAppliedProjectIds] = useState(() => new Set())
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [authUser, setAuthUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [form, setForm] = useState({ title: '', projectName: '', description: '', duration: '', status: 'open' })
  const canManage = ['manager', 'admin'].includes(String(authUser?.role || '').toLowerCase())
  const canViewUsers = String(authUser?.role || '').toLowerCase() === 'superadmin'
  const canViewMyApplications = String(authUser?.role || '').toLowerCase() === 'applicant'
  const filteredProjects = useMemo(() => projects.filter((project) => (category === 'All projects' || String(project.status || '').toLowerCase() === category.toLowerCase()) && `${project.title || ''} ${project.projectName || ''} ${project.manager?.displayName || ''} ${project.manager?.email || ''}`.toLowerCase().includes(search.toLowerCase())), [projects, category, search])
  const filteredUsers = useMemo(() => users.filter((user) => `${user.displayName || ''} ${user.email || ''} ${user.role || ''} ${user.status || ''}`.toLowerCase().includes(userSearch.toLowerCase())), [users, userSearch])
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2800) }
  const navigate = (next) => { setPage(next); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  useEffect(() => {
    const restorePage = () => setPage(window.location.hash.replace('#', '') || 'home')
    window.addEventListener('popstate', restorePage)
    window.addEventListener('hashchange', restorePage)
    return () => {
      window.removeEventListener('popstate', restorePage)
      window.removeEventListener('hashchange', restorePage)
    }
  }, [])
  const go = (next) => {
    let destination = next
    if (next === 'users' && !canViewUsers) {
      destination = authUser ? 'home' : 'login'
      if (authUser) notify('The Users page is only available to superAdmins.')
    } else if (next === 'my-applications' && !canViewMyApplications) {
      destination = authUser ? 'home' : 'login'
      if (authUser) notify('My applications is only available to applicants.')
    } else if (['manager', 'my-projects'].includes(next) && !canManage) {
      destination = authUser ? 'home' : 'login'
      if (authUser) notify('The manager page is only available to managers and admins.')
    }
    window.history.pushState({}, '', destination === 'home' ? window.location.pathname : `#${destination}`)
    navigate(destination)
  }

  useEffect(() => {
    let active = true
    setProjectsLoading(true)
    setProjectsError('')
    fetchProjects()
      .then((items) => { if (active) setProjects(items) })
      .catch((error) => { if (active) setProjectsError(error.message || 'Could not load projects.') })
      .finally(() => { if (active) setProjectsLoading(false) })
    return () => { active = false }
  }, [projectRefresh])

  useEffect(() => {
    if (page !== 'my-projects' || !canManage) return undefined
    let active = true
    setMyProjectsLoading(true)
    setMyProjectsError('')
    fetchMyProjects()
      .then((items) => { if (active) setMyProjects(items) })
      .catch((error) => { if (active) setMyProjectsError(error.message || 'Could not load your projects.') })
      .finally(() => { if (active) setMyProjectsLoading(false) })
    return () => { active = false }
  }, [page, canManage, projectRefresh])

  useEffect(() => {
    if (page !== 'users' || !canViewUsers) return undefined
    let active = true
    setUsersLoading(true)
    setUsersError('')
    fetchAllUsers()
      .then((items) => { if (active) setUsers(items) })
      .catch((error) => { if (active) setUsersError(error.message || 'Could not load users.') })
      .finally(() => { if (active) setUsersLoading(false) })
    return () => { active = false }
  }, [page, canViewUsers, usersRefresh])

  useEffect(() => {
    if (page !== 'my-applications' || !canViewMyApplications) return undefined
    let active = true
    setMyApplicationsLoading(true)
    setMyApplicationsError('')
    fetchMyApplications()
      .then((items) => { if (active) setMyApplications(items) })
      .catch((error) => { if (active) setMyApplicationsError(error.message || 'Could not load your applications.') })
      .finally(() => { if (active) setMyApplicationsLoading(false) })
    return () => { active = false }
  }, [page, canViewMyApplications, applicationsRefresh])

  useEffect(() => {
    const accessToken = localStorage.getItem('sparkAccessToken')
    if (!accessToken) return undefined
    const tokenType = localStorage.getItem('sparkTokenType') || 'Bearer'
    let active = true
    setAuthLoading(true)
    fetchCurrentUser(accessToken, tokenType)
      .then((user) => {
        if (!active) return
        setAuthUser(user)
        setLoginSuccess(true)
        setProfileError('')
      })
      .catch((error) => {
        if (!active) return
        setProfileError(error.message || 'Could not load your account details.')
        if (error.status === 401) {
          clearAuthStorage()
          setLoginSuccess(false)
        }
      })
      .finally(() => { if (active) setAuthLoading(false) })
    return () => { active = false }
  }, [])

  const handlePost = async (event) => {
    event.preventDefault()
    setProjectSubmitting(true)
    setProjectSubmitError('')
    const projectPayload = {
      title: form.title.trim(),
      projectName: form.projectName.trim() || null,
      description: form.description.trim(),
      duration: form.duration.trim() || null,
      status: form.status,
    }
    try {
      const accessToken = localStorage.getItem('sparkAccessToken')
      const headers = { 'Content-Type': 'application/json' }
      if (accessToken) headers.Authorization = `${localStorage.getItem('sparkTokenType') || 'Bearer'} ${accessToken}`
      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers,
        body: JSON.stringify(projectPayload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || result.error || 'Could not publish the project. Please try again.')
      setForm({ title: '', projectName: '', description: '', duration: '', status: 'open' })
      setProjectRefresh((revision) => revision + 1)
      notify(`${projectPayload.title} was published.`)
    } catch (error) {
      setProjectSubmitError(error.message || 'Could not connect to the project service.')
    } finally {
      setProjectSubmitting(false)
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    setLoginSuccess(false)

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email.trim(), password: credentials.password }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || data.error || 'We could not sign you in. Check your details and try again.')
      }
      if (!data.accessToken) {
        throw new Error('The login service did not return an access token. Please try again.')
      }

      clearAuthStorage()
      localStorage.setItem('sparkAccessToken', data.accessToken)
      localStorage.setItem('sparkTokenType', data.tokenType || 'Bearer')
      localStorage.setItem('sparkExpiresAt', String(Date.now() + (data.expiresIn || 0) * 1000))
      if (data.refreshToken) localStorage.setItem('sparkRefreshToken', data.refreshToken)
      sessionStorage.removeItem('sparkAccessToken')
      sessionStorage.removeItem('sparkTokenType')
      sessionStorage.removeItem('sparkExpiresAt')
      sessionStorage.removeItem('sparkRefreshToken')
      setAuthLoading(true)
      setProfileError('')
      try {
        const user = await fetchCurrentUser(data.accessToken, data.tokenType || 'Bearer')
        setAuthUser(user)
      } catch (profileFetchError) {
        setAuthUser(null)
        setProfileError(profileFetchError.message || 'Signed in, but could not load your profile.')
        if (profileFetchError.status === 401) {
          clearAuthStorage()
          throw new Error('Your session was not accepted. Please sign in again.')
        }
      } finally {
        setAuthLoading(false)
      }
      setCredentials((current) => ({ ...current, password: '' }))
      setLoginSuccess(true)
      setProjectRefresh((revision) => revision + 1)
      go('home')
    } catch (error) {
      setLoginError(error.message || 'Unable to connect to the login service. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuthStorage()
    setAuthUser(null)
    setAuthLoading(false)
    setLoginSuccess(false)
    setLoginError('')
    setProfileError('')
    setCredentials({ email: '', password: '' })
    setAppliedProjectIds(new Set())
    go('home')
    notify('You have been logged out.')
  }

  const handleApply = async (project) => {
    const projectId = project.projectId || project.id
    const accessToken = localStorage.getItem('sparkAccessToken')
    if (!accessToken) {
      go('login')
      notify('Sign in to apply for a project.')
      return
    }
    if (!projectId) {
      notify('This project is missing an ID, so it cannot accept applications yet.')
      return
    }

    setApplyingProjectId(projectId)
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${encodeURIComponent(projectId)}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${localStorage.getItem('sparkTokenType') || 'Bearer'} ${accessToken}`,
        },
        body: JSON.stringify({ message: 'I’m interested in contributing to this project.' }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || result.error || 'Your application could not be submitted. Please try again.')
      setAppliedProjectIds((existing) => new Set(existing).add(projectId))
      notify('Your application has been submitted.')
    } catch (error) {
      notify(error.message || 'Could not connect to the application service.')
    } finally {
      setApplyingProjectId('')
    }
  }

  const handleViewApplicants = async (project) => {
    const projectId = project.projectId || project.id
    const accessToken = localStorage.getItem('sparkAccessToken')
    if (!accessToken) {
      notify('Sign in to view project applicants.')
      go('login')
      return
    }
    if (!projectId) {
      notify('This project is missing an ID, so its applicants cannot be loaded.')
      return
    }

    setApplicantsProject(project)
    setApplicants([])
    setApplicantsError('')
    setApplicantsLoading(true)
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${encodeURIComponent(projectId)}/applications`, {
        headers: { Authorization: `${localStorage.getItem('sparkTokenType') || 'Bearer'} ${accessToken}` },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || data.error || 'Could not load applicants for this project.')
      if (!Array.isArray(data)) throw new Error('The applications service returned an unexpected response.')
      setApplicants(data)
    } catch (error) {
      setApplicantsError(error.message || 'Could not load applicants for this project.')
    } finally {
      setApplicantsLoading(false)
    }
  }

  const handleUpdateApplicationStatus = async (application, status) => {
    const projectId = applicantsProject?.projectId || applicantsProject?.id
    const userId = application.userId
    const accessToken = localStorage.getItem('sparkAccessToken')
    if (!projectId || !userId || !accessToken) {
      notify('The project, applicant, or session is missing. Please refresh and try again.')
      return
    }

    setUpdatingApplicationUserId(userId)
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${encodeURIComponent(projectId)}/applications/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${localStorage.getItem('sparkTokenType') || 'Bearer'} ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || result.error || 'Could not update the application status.')
      setApplicants((current) => current.map((item) => item.id === application.id || item.userId === userId ? { ...item, status: result?.status || status } : item))
      notify(`Applicant marked ${status}.`)
    } catch (error) {
      notify(error.message || 'Could not connect to the application service.')
    } finally {
      setUpdatingApplicationUserId('')
    }
  }

  const handleCreateUser = async (event) => {
    event.preventDefault()
    setCreatingUser(true)
    setCreateUserError('')
    try {
      const accessToken = localStorage.getItem('sparkAccessToken')
      if (!accessToken) throw new Error('Your session has expired. Please sign in again.')
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${localStorage.getItem('sparkTokenType') || 'Bearer'} ${accessToken}`,
        },
        body: JSON.stringify({
          email: newUser.email.trim(),
          displayName: newUser.displayName.trim(),
          password: newUser.password,
          role: newUser.role,
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || result.error || 'Could not create the user. Please try again.')
      setNewUser({ email: '', displayName: '', password: '', role: 'applicant' })
      setUsersRefresh((revision) => revision + 1)
      notify('User created successfully.')
    } catch (error) {
      setCreateUserError(error.message || 'Could not connect to the user service.')
    } finally {
      setCreatingUser(false)
    }
  }

  return <div className="app-shell">
    <header className="site-header"><div className="nav-wrap"><Brand onClick={() => go('home')} />
      <nav className={mobileMenu ? 'main-nav open' : 'main-nav'} aria-label="Main navigation"><button className={page === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => go('home')}>Home</button><button className={page === 'jobs' ? 'nav-link active' : 'nav-link'} onClick={() => go('jobs')}>View Projects</button>{canManage && <><button className={page === 'manager' ? 'nav-link active' : 'nav-link'} onClick={() => go('manager')}>Post a project</button><button className={page === 'my-projects' ? 'nav-link active' : 'nav-link'} onClick={() => go('my-projects')}>My projects</button></>}{canViewUsers && <button className={page === 'users' ? 'nav-link active' : 'nav-link'} onClick={() => go('users')}>Users</button>}{canViewMyApplications && <button className={page === 'my-applications' ? 'nav-link active' : 'nav-link'} onClick={() => go('my-applications')}>My applications</button>}{authUser && <div className="mobile-user-summary"><b>{authUser.displayName}</b><span>{authUser.email}</span><em>{authUser.role}</em></div>}<button className="nav-link mobile-login-link" onClick={authUser ? handleLogout : () => go('login')}>{authUser ? 'Log out' : authLoading ? 'Loading account…' : 'Sign in'}</button></nav>
      <div className="nav-actions">{authUser && <div className="auth-user-summary"><b>{authUser.displayName}</b><span>{authUser.role}</span></div>}{authLoading && !authUser && <span className="auth-loading-label">Loading…</span>}<button className="signin" onClick={authUser ? handleLogout : () => go('login')}>{authUser ? 'Log out' : 'Sign in'}</button>{canManage && <button className="button button-teal nav-cta" onClick={() => go('manager')}>Post a project <Arrow /></button>}</div><button className="menu-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation"><span></span><span></span></button>
    </div></header>

    {page === 'login' && <main className="login-page"><div className="login-card"><div className="login-emblem">✳</div><span className="section-kicker">WELCOME BACK</span><h1>Good to see you.</h1><p className="login-intro">Sign in to continue to your Spark account.</p>{loginSuccess ? <div className="login-success login-profile" role="status"><span>✓</span><div><b>{authUser ? `Welcome, ${authUser.displayName}` : 'You’re signed in.'}</b>{authUser ? <><p>{authUser.email}</p><span className="profile-role">{authUser.role}</span></> : authLoading ? <p>Loading your account details…</p> : <p>Your session is ready.</p>}{profileError && <p className="profile-error">{profileError}</p>}</div><button className="button button-teal" onClick={() => go('home')}>Continue <Arrow /></button></div> : <form className="login-form" onSubmit={handleLogin}>
      <label>Email or username<input autoComplete="username" required value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} placeholder="you@example.com" /></label>
      <label>Password<input autoComplete="current-password" type="password" required value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} placeholder="Enter your password" /></label>
      {loginError && <p className="login-error" role="alert">{loginError}</p>}
      <button className="button button-teal login-submit" type="submit" disabled={loginLoading}>{loginLoading ? 'Signing in…' : 'Sign in'} {!loginLoading && <Arrow />}</button>
      <p className="login-help">New to Spark? <button type="button" onClick={() => go('jobs')}>Explore projects</button></p>
    </form>}</div><div className="login-aside"><span className="aside-spark">✳</span><p>Every great career starts somewhere.</p><span>Find your next step with Spark.</span></div></main>}

    {page === 'home' && <main>
      <section className="hero-section"><div className="hero-inner"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"></span> A brighter start to your career</div><h1>Every big idea<br />starts with a <span>SPARK.</span></h1><p className="hero-subtitle">Spark connects fresh graduates with teams ready to give new talent a chance. Explore real projects, meet great teams, and bring your curiosity to work.</p><div className="hero-buttons"><button className="button button-teal" onClick={() => go('jobs')}>Explore projects <Arrow /></button>{canManage && <button className="text-button" onClick={() => go('manager')}>I'm hiring <Arrow diagonal /></button>}</div><div className="hero-proof"><div className="avatar-stack"><span className="mini-avatar a1">A</span><span className="mini-avatar a2">R</span><span className="mini-avatar a3">M</span><span className="mini-avatar a4">+</span></div><div><strong>2,400+</strong><span>risers found their spark</span></div></div></div>
      <div className="hero-art" aria-label="Illustration of a new graduate exploring career opportunities"><div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div><div className="art-sun"></div><div className="art-spark">✳</div><div className="art-card card-one"><span className="tiny-logo logo-green">G</span><div><b>Product Designer</b><small>Bengaluru</small></div><span className="card-dot"></span></div><div className="art-card card-two"><span className="tiny-logo logo-blue">R</span><div><b>HMI Developer</b><small>Chennai</small></div></div><div className="person-illustration"><div className="person-shadow"></div><div className="person-body"></div><div className="person-neck"></div><div className="person-head"></div><div className="person-hair"></div><div className="person-arm"></div><div className="person-laptop"><span>✳</span></div></div><div className="art-caption"><span>✦</span> your next chapter, right this way</div></div></div></section>

      <section className="section jobs-section"><div className="section-heading"><div><span className="section-kicker">PROJECTS TO EXPLORE</span><h2>Find a project that<br className="desktop-break" /> sparks your curiosity.</h2></div><button className="text-button view-all" onClick={() => go('jobs')}>View all projects <Arrow /></button></div>{projectsLoading ? <div className="project-message">Loading projects…</div> : projectsError ? <div className="project-message project-error">{projectsError}</div> : projects.length ? <div className="project-grid home-project-grid">{projects.slice(0, 3).map((project) => <ProjectCard key={project.id || project.projectId} project={project} onApply={handleApply} isApplying={applyingProjectId === (project.projectId || project.id)} isApplied={appliedProjectIds.has(project.projectId || project.id)} showApply={!canManage && !canViewUsers} />)}</div> : <div className="project-message">New projects will appear here as soon as they’re posted.</div>}</section>

      <section className="how-section"><div className="how-intro"><span className="section-kicker">MADE FOR YOUR FIRST MOVE</span><h2>Good things happen<br />when you get started.</h2><p>Searching for your first opportunity can feel like a full-time job. Spark keeps it simple, human, and full of possibility.</p><button className="text-button" onClick={() => go('jobs')}>Find your starting point <Arrow /></button></div><div className="steps"><div className="step"><span className="step-num">01</span><div className="step-icon icon-search"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg></div><div><h3>Find your fit</h3><p>Discover thoughtful roles from teams that are excited to meet early career talent.</p></div></div><div className="step"><span className="step-num">02</span><div className="step-icon icon-spark">✳</div><div><h3>Show what makes you, you</h3><p>Bring your skills, ideas, and curiosity. Your potential deserves the spotlight.</p></div></div><div className="step"><span className="step-num">03</span><div className="step-icon icon-arrow"><Arrow diagonal /></div><div><h3>Start your next chapter</h3><p>Meet people who will help you grow and do work that matters from day one.</p></div></div></div></section>

      <section className="testimonial-section"><div className="testimonial-heading"><span className="section-kicker">GOOD PEOPLE. GOOD STARTS.</span><h2>Don't just take our word for it.</h2><p>Check the testimonials.</p></div><div className="testimonial-grid">{testimonials.map((item) => <article className="testimonial-card" key={item.name}><div className="quote-mark">“</div><p className="quote">{item.quote}</p><div className="testimonial-person"><div className={`person-avatar ${item.color}`}>{item.initials}</div><div><b>{item.name}</b><span>{item.role}</span></div><span className="quote-stars">★★★★★</span></div></article>)}</div></section>
      <section className="bottom-cta"><div><span className="section-kicker">YOUR NEXT CHAPTER IS WAITING</span><h2>A little spark can go a long way.</h2><p>Take the first step. Your future self will thank you.</p></div><button className="button button-dark" onClick={() => go('jobs')}>Find an opportunity <Arrow /></button><span className="cta-flower">✳</span></section>
    </main>}

    {page === 'jobs' && <main className="page-main"><div className="page-hero jobs-hero"><div><span className="section-kicker">SPARK PROJECTS</span><h1>Explore projects.</h1><p>Browse current projects and the teams looking for fresh perspectives.</p></div><div className="job-hero-mark">✳</div></div><div className="search-panel"><label className="search-box"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Project, manager, or keyword" /></label><label className="filter-box"><span>Status</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{['All projects', ...new Set(projects.map((project) => String(project.status || '').toLowerCase()).filter(Boolean))].map((option) => <option key={option}>{option === 'All projects' ? option : option.charAt(0).toUpperCase() + option.slice(1)}</option>)}</select></label><button className="button button-teal search-button" onClick={() => setProjectRefresh((revision) => revision + 1)}>Refresh projects <Arrow /></button></div><div className="results-bar"><span><b>{filteredProjects.length}</b> projects to explore</span><span>Showing newest first <span className="sort-icon">↕</span></span></div>{projectsLoading ? <div className="project-message">Loading projects…</div> : projectsError ? <div className="empty-state"><span>✳</span><h3>Projects couldn’t load</h3><p>{projectsError}</p><button className="text-button" onClick={() => setProjectRefresh((revision) => revision + 1)}>Try again <Arrow /></button></div> : filteredProjects.length ? <div className="project-grid listing-grid">{filteredProjects.map((project) => <ProjectCard key={project.id || project.projectId} project={project} onApply={handleApply} isApplying={applyingProjectId === (project.projectId || project.id)} isApplied={appliedProjectIds.has(project.projectId || project.id)} showApply={!canManage && !canViewUsers} />)}</div> : <div className="empty-state"><span>✳</span><h3>No projects found</h3><p>Try a different keyword or status.</p><button className="text-button" onClick={() => { setSearch(''); setCategory('All projects') }}>Clear filters <Arrow /></button></div>}</main>}

    {page === 'users' && canViewUsers && <main className="page-main users-page">
      <div className="page-hero"><div><span className="section-kicker">ADMINISTRATION</span><h1>Users.</h1><p>Browse the people who use Spark.</p></div><button className="button button-teal" onClick={() => setUsersRefresh((revision) => revision + 1)}>Refresh users <Arrow /></button></div>
      <section className="users-create-card"><div className="users-create-heading"><div><span className="section-kicker">USER MANAGEMENT</span><h2>Add a user</h2><p>Create an applicant, manager, or superAdmin account.</p></div></div><form className="post-form" onSubmit={handleCreateUser}><div className="form-grid users-create-grid">
        <label><span className="field-label">Email <i>*</i></span><input type="email" required autoComplete="off" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} placeholder="name@company.com" /></label>
        <label><span className="field-label">Display name <i>*</i></span><input required value={newUser.displayName} onChange={(event) => setNewUser({ ...newUser, displayName: event.target.value })} placeholder="Full name" /></label>
        <label><span className="field-label">Password <i>*</i></span><input type="password" required autoComplete="new-password" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} placeholder="Create a password" /></label>
        <label><span className="field-label">Role <i>*</i></span><select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}><option value="applicant">Applicant</option><option value="manager">Manager</option><option value="superAdmin">SuperAdmin</option></select></label>
      </div>{createUserError && <p className="project-submit-error" role="alert">{createUserError}</p>}<div className="form-footer"><p>All fields are required.</p><button className="button button-teal" type="submit" disabled={creatingUser}>{creatingUser ? 'Creating user…' : 'Create user'} {!creatingUser && <Arrow />}</button></div></form></section>
      <div className="search-panel users-search-panel"><label className="search-box"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search name, email, role, or status" /></label></div>
      <div className="results-bar"><span><b>{filteredUsers.length}</b> users</span></div>
      {usersLoading ? <div className="project-message">Loading users…</div> : usersError ? <div className="empty-state"><span>✳</span><h3>Users couldn’t load</h3><p>{usersError}</p><button className="text-button" onClick={() => setUsersRefresh((revision) => revision + 1)}>Try again <Arrow /></button></div> : filteredUsers.length ? <div className="users-table-wrap"><table className="users-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Created</th><th>User ID</th></tr></thead><tbody>{filteredUsers.map((user, index) => <tr key={`${user.userId || user.email || 'user'}-${user.role || ''}-${index}`}><td><b>{user.displayName || 'Unnamed user'}</b><span>{user.email || 'Email unavailable'}</span></td><td><span className={`user-role ${String(user.role || '').toLowerCase()}`}>{user.role || 'Unknown'}</span></td><td><span className={`user-status ${String(user.status || 'unknown').toLowerCase()}`}>{user.status || 'Unknown'}</span></td><td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not provided'}</td><td className="user-id-cell">{user.userId || 'Not provided'}</td></tr>)}</tbody></table></div> : <div className="empty-state"><span>✳</span><h3>No users found</h3><p>Try a different search.</p><button className="text-button" onClick={() => setUserSearch('')}>Clear search <Arrow /></button></div>}
    </main>}

    {page === 'my-applications' && canViewMyApplications && <main className="page-main my-applications-page"><div className="page-hero"><div><span className="section-kicker">APPLICANT DASHBOARD</span><h1>My applications.</h1><p>Keep track of the projects you’ve applied to.</p></div><button className="button button-teal" onClick={() => setApplicationsRefresh((revision) => revision + 1)}>Refresh applications <Arrow /></button></div><div className="results-bar"><span><b>{myApplications.length}</b> applications</span><button className="text-button" onClick={() => go('jobs')}>Explore more projects <Arrow /></button></div>{myApplicationsLoading ? <div className="project-message">Loading your applications…</div> : myApplicationsError ? <div className="empty-state"><span>✳</span><h3>Applications couldn’t load</h3><p>{myApplicationsError}</p><button className="text-button" onClick={() => setApplicationsRefresh((revision) => revision + 1)}>Try again <Arrow /></button></div> : myApplications.length ? <div className="my-applications-list">{myApplications.map((application, index) => { const project = projects.find((item) => (item.projectId || item.id) === application.projectId); return <MyApplicationCard key={application.id || `${application.projectId}-${index}`} application={application} project={project} /> })}</div> : <div className="empty-state"><span>✳</span><h3>No applications yet</h3><p>Projects you apply to will appear here.</p><button className="button button-teal" onClick={() => go('jobs')}>Explore projects <Arrow /></button></div>}</main>}

    {page === 'my-applications' && !canViewMyApplications && <main className="page-main access-denied"><div className="access-denied-card"><span className="section-kicker">APPLICANT ACCESS</span><h1>{authLoading ? 'Checking your account…' : authUser ? 'This page is for applicants.' : 'Sign in to continue.'}</h1><p>{authLoading ? 'We’re checking your account role.' : authUser ? 'Your account does not have access to applicant applications.' : 'Sign in with an applicant account to view your applications.'}</p>{!authLoading && <button className="button button-teal" onClick={() => go(authUser ? 'home' : 'login')}>{authUser ? 'Back to Spark' : 'Sign in'} <Arrow /></button>}</div></main>}

    {page === 'users' && !canViewUsers && <main className="page-main access-denied"><div className="access-denied-card"><span className="section-kicker">SUPERADMIN ACCESS</span><h1>{authLoading ? 'Checking your account…' : authUser ? 'This page is restricted.' : 'Sign in to continue.'}</h1><p>{authLoading ? 'We’re checking your account role.' : authUser ? 'The Users page is only available to superAdmins.' : 'Sign in with a superAdmin account to view users.'}</p>{!authLoading && <button className="button button-teal" onClick={() => go(authUser ? 'home' : 'login')}>{authUser ? 'Back to Spark' : 'Sign in'} <Arrow /></button>}</div></main>}

    {['manager', 'my-projects'].includes(page) && !canManage && <main className="page-main access-denied"><div className="access-denied-card"><span className="section-kicker">MANAGER ACCESS</span><h1>{authLoading ? 'Checking your account…' : authUser ? 'This page is for managers.' : 'Sign in to continue.'}</h1><p>{authLoading ? 'We’re checking your account role.' : authUser ? 'Your account does not have permission to manage projects.' : 'Sign in with a manager or admin account to continue.'}</p>{!authLoading && <button className="button button-teal" onClick={() => go(authUser ? 'home' : 'login')}>{authUser ? 'Back to Spark' : 'Sign in'} <Arrow /></button>}</div></main>}

    {page === 'my-projects' && canManage && <main className="page-main my-projects-page"><div className="page-hero"><div><span className="section-kicker">MANAGER DASHBOARD</span><h1>My projects.</h1><p>Review projects you’ve posted to Spark.</p></div><button className="button button-teal" onClick={() => go('manager')}>Post a project <Arrow /></button></div><div className="results-bar"><span><b>{myProjects.length}</b> projects posted by you</span><button className="text-button" onClick={() => setProjectRefresh((revision) => revision + 1)}>Refresh <Arrow /></button></div>{myProjectsLoading ? <div className="project-message">Loading your projects…</div> : myProjectsError ? <div className="empty-state"><span>✳</span><h3>Your projects couldn’t load</h3><p>{myProjectsError}</p><button className="text-button" onClick={() => setProjectRefresh((revision) => revision + 1)}>Try again <Arrow /></button></div> : myProjects.length ? <div className="project-grid listing-grid manager-project-grid">{myProjects.map((project) => <ProjectCard key={project.id || project.projectId} project={project} showApply={false} showApplicants onViewApplicants={handleViewApplicants} />)}</div> : <div className="empty-state"><span>✳</span><h3>You haven’t posted a project yet</h3><p>Projects you publish will appear here.</p><button className="button button-teal" onClick={() => go('manager')}>Post your first project <Arrow /></button></div>}</main>}

    {page === 'manager' && canManage && <main className="page-main manager-main">
      <div className="manager-intro"><div><span className="section-kicker">FOR PEOPLE WHO BUILD TEAMS</span><h1>Meet your next<br /><span>great teammate.</span></h1><p>Great potential deserves a great first opportunity. Share a project with a community of curious, motivated risers ready to make an impact.</p><div className="manager-benefits"><span><i>✓</i> Reach early career talent</span><span><i>✓</i> Simple, thoughtful applications</span><span><i>✓</i> Find people who are ready to grow</span></div></div><div className="manager-graphic"><div className="manager-orbit"></div><div className="manager-bubble bubble-one">✳</div><div className="manager-bubble bubble-two">↗</div><div className="manager-note"><span className="note-label">A good match</span><div className="note-person"><span className="note-avatar">AK</span><div><b>Arjun Kumar</b><small>Product Design · 2026</small></div><span className="match-score">98%</span></div><div className="match-bars"><i></i><i></i><i></i></div><span className="note-bottom">Curiosity meets opportunity</span></div></div></div>
      <div className="post-form-wrap"><div className="form-heading"><div><span className="section-kicker">CREATE A PROJECT</span><h2>Post a project on Spark</h2><p>Share the details risers need to understand your project.</p></div><span className="form-step">01 <i>/</i> 01</span></div>
        <form className="post-form" onSubmit={handlePost}><div className="form-grid project-form-grid">
          <label><span className="field-label">Title <i>*</i></span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. AUTOSAR Code Generator" /></label>
          <label><span className="field-label">Project name <small>Optional</small></span><input value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} placeholder="e.g. AUTOSAR Tooling" /></label>
          <label className="full-field"><span className="field-label">Description <i>*</i></span><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the project and the work involved." rows="4" /></label>
          <label><span className="field-label">Duration <small>Optional</small></span><input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 6 sprints" /></label>
          <label><span className="field-label">Status <i>*</i></span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="open">Open</option><option value="closed">Closed</option></select></label>
        </div>{projectSubmitError && <p className="project-submit-error" role="alert">{projectSubmitError}</p>}<div className="form-footer"><p>New projects start with an open status.</p><button className="button button-teal" type="submit" disabled={projectSubmitting}>{projectSubmitting ? 'Publishing…' : 'Publish project'} {!projectSubmitting && <Arrow />}</button></div></form>
      </div><div className="manager-footnote"><span>✳</span><p>Manage your existing posts: <button onClick={() => go('my-projects')}>View my projects</button></p></div>
    </main>}

    <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><Brand onClick={() => go('home')} /><p>A brighter start to your career.<br />Made for risers, built for what's next.</p></div><div className="footer-links"><div><b>Explore</b><button onClick={() => go('jobs')}>View projects</button>{canManage && <><button onClick={() => go('manager')}>Post a project</button><button onClick={() => go('my-projects')}>My projects</button></>}</div><div><b>About Spark</b><button onClick={() => notify('Spark is here to make the first step a little easier.')}>Our story</button><button onClick={() => notify('Say hello at hello@spark.careers')}>Get in touch</button></div></div><div className="footer-note"><span>Made for the beginning.</span><b>✳</b></div></div><div className="footer-bottom"><span>© 2026 Visteon Corporation</span><span>Good things start here <b>✳</b></span><span>Privacy&nbsp;&nbsp;&nbsp; Terms</span></div></footer>

    {applicantsProject && <div className="modal-backdrop" onClick={() => setApplicantsProject(null)}><section className="applicants-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setApplicantsProject(null)} aria-label="Close applicants">×</button><span className="section-kicker">PROJECT APPLICANTS</span><h2>{applicantsProject.title || 'Project applicants'}</h2><p className="applicants-count">{applicantsLoading ? 'Loading applications…' : `${applicants.length} ${applicants.length === 1 ? 'applicant' : 'applicants'}`}</p>{applicantsLoading ? <div className="project-message">Loading applicants…</div> : applicantsError ? <div className="project-message project-error" role="alert">{applicantsError}</div> : applicants.length ? <div className="applicant-list">{applicants.map((application) => <ApplicantCard key={application.id} application={application} onChangeStatus={handleUpdateApplicationStatus} isUpdating={updatingApplicationUserId === application.userId} />)}</div> : <div className="empty-state applicants-empty"><span>✳</span><h3>No applicants yet</h3><p>Applications for this project will appear here.</p></div>}</section></div>}
    {toast && <div className="toast" role="status"><span>✳</span>{toast}</div>}
  </div>
}

export default App
