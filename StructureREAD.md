app/ (all customer pages - page.ts)
app/admin/ (all admin pages - page.ts)

app/api/ (all customer api - route.ts)
app/api/admin/ (all admin api - route.ts )

components/admin/[page name like in app/admin/] (components like edit/view/create modal here of that page)

components/ [page name like in app/] (components like edit/view/create modal here of that page)

component/ui/ (UI compnents like text button etc)

context/ (appcontext)

database/data-service (Server side CRUD for customers)
database/mongodb.ts (connection of mondoDB)
database/redisClient.ts (connection of redis)

lib/api/admin/[pages name]/[page name.ts] (code like fetch helper reside here so that ui page do not clutter)

lib/api/[pages name]/[page name.ts] (code like fetch helper reside here so that ui page do not clutter)

lib/constants/ (constants for webpages)

lib/providers/ (app providers,auth provider etc)

lib/utils/imageUploader (helper function to upload image/video and return url - only use this)
lib/utils/ (all utils like cn in lib/utils/utils )

middlewares/ (all middlewares)

models/ (all schema models)
models/constants (all database relevent constants)
