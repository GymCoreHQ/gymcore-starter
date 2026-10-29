# Offline app schedule

Members can open the weekly class timetable from GymCore's installed app when offline. The companion plugin declares published pages containing the Weekly class schedule block through the `gymcore_pwa_offline_pages` filter. With the PWA enabled, GymCore saves a signed-out copy of each declared page, refreshes it after 12 hours, and makes that copy available offline.

Requirements: install GymCore with its PWA enabled and publish a page containing the Weekly class schedule block. The theme intentionally ships no service worker, manifest, or other PWA files; offline-page declaration belongs to the companion plugin.

Location and day filters render server-side. The saved copy shows the page as it was rendered when fetched; it does not update filters or schedule data while offline. Only public published pages are declared. Draft, private, and password-protected pages are excluded because GymCore fetches pages signed-out.
