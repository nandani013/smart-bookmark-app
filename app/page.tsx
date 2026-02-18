"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {

const [user, setUser] = useState<any>(null);
const [bookmarks, setBookmarks] = useState<any[]>([]);
const [title, setTitle] = useState("");
const [url, setUrl] = useState("");


// Restore session
useEffect(() => {

const getSession = async () => {

const { data } = await supabase.auth.getSession();

const sessionUser = data.session?.user;

setUser(sessionUser);

if (sessionUser) {
fetchBookmarks(sessionUser.id);
}

};

getSession();

const { data: listener } = supabase.auth.onAuthStateChange(
(_event, session) => {

const sessionUser = session?.user;

setUser(sessionUser);

if (sessionUser) {
fetchBookmarks(sessionUser.id);
}

});

return () => {
listener.subscription.unsubscribe();
};

}, []);




// Login
const login = async () => {

await supabase.auth.signInWithOAuth({
provider: "google",
});

};




// Logout
const logout = async () => {

await supabase.auth.signOut();

setUser(null);
setBookmarks([]);

};




// Fetch bookmarks
const fetchBookmarks = async (userId:any) => {

const { data } = await supabase
.from("bookmarks")
.select("*")
.eq("user_id", userId)
.order("created_at", { ascending:false });

setBookmarks(data || []);

};




// Add bookmark
const addBookmark = async () => {

if (!title || !url) return;

await supabase.from("bookmarks").insert({
title,
url,
user_id: user.id
});

setTitle("");
setUrl("");

};




// Delete bookmark
const deleteBookmark = async (id:any) => {

await supabase
.from("bookmarks")
.delete()
.eq("id", id);

};




// Realtime sync
useEffect(() => {

if (!user) return;

let ignore = false;

const channel = supabase
.channel("bookmarks-realtime", {
config: {
broadcast: { self: true },
},
})

.on(
"postgres_changes",
{
event: "*",
schema: "public",
table: "bookmarks",
filter: `user_id=eq.${user.id}`,
},
() => {

if (!ignore) {
fetchBookmarks(user.id);
}

}
)

.subscribe();


// fallback sync
const interval = setInterval(() => {

if (!ignore) {
fetchBookmarks(user.id);
}

}, 1000);


return () => {

ignore = true;

supabase.removeChannel(channel);

clearInterval(interval);

};

}, [user]);





// LOGIN UI
if (!user)
return (

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">

<div className="bg-white shadow-xl rounded-2xl p-10 text-center w-80">

<h1 className="text-3xl font-bold text-gray-800 mb-2">
🔖 Smart Bookmark
</h1>

<p className="text-gray-500 mb-6">
Save and manage your bookmarks
</p>

<button
onClick={login}
className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition font-medium">

Login with Google

</button>

</div>

</div>

);





// MAIN UI
return (

<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

<div className="max-w-2xl mx-auto pt-12 px-4">




{/* Header */}
<div className="bg-white shadow-lg rounded-2xl p-6 flex justify-between items-center">

<h1 className="text-2xl font-bold text-gray-800">
🔖 Smart Bookmark
</h1>

<button
onClick={logout}
className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">

Logout

</button>

</div>





{/* Add bookmark */}
<div className="bg-white shadow-lg rounded-2xl p-6 mt-6">

<h2 className="font-semibold mb-4 text-gray-700">
Add New Bookmark
</h2>

<div className="flex flex-col sm:flex-row gap-3">

<input
placeholder="Title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
className="border rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
/>


<input
placeholder="URL"
value={url}
onChange={(e)=>setUrl(e.target.value)}
className="border rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
/>


<button
onClick={addBookmark}
disabled={!title || !url}
className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition">

Add

</button>

</div>

</div>





{/* Bookmark list */}
<div className="mt-6 space-y-3">

{bookmarks.length === 0 && (

<div className="text-center text-gray-500 mt-10">
No bookmarks yet
</div>

)}



{bookmarks.map((b)=> (

<div
key={b.id}
className="bg-white shadow-lg rounded-xl p-4 flex justify-between items-center hover:shadow-xl transition">

<div className="overflow-hidden">

<a
href={b.url}
target="_blank"
className="text-blue-600 font-semibold hover:underline flex items-center gap-2">

{b.title}

<span>🔗</span>

</a>

<p className="text-sm text-gray-500 truncate max-w-xs">
{b.url}
</p>

</div>



<button
onClick={()=>deleteBookmark(b.id)}
className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition">

Delete

</button>

</div>

))}

</div>





</div>

</div>

);

}
