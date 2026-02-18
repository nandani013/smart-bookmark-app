"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {

const [user, setUser] = useState<any>(null);
const [bookmarks, setBookmarks] = useState<any[]>([]);
const [title, setTitle] = useState("");
const [url, setUrl] = useState("");


// ✅ Restore session properly
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



// login
const login = async () => {

await supabase.auth.signInWithOAuth({
provider: "google",
});

};


// logout
const logout = async () => {

await supabase.auth.signOut();

setUser(null);
setBookmarks([]);

};



// fetch bookmarks
const fetchBookmarks = async (userId:any) => {

const { data } = await supabase
.from("bookmarks")
.select("*")
.eq("user_id", userId)
.order("created_at", { ascending:false });

setBookmarks(data || []);

};



// add bookmark
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



// delete bookmark
const deleteBookmark = async (id:any) => {

await supabase
.from("bookmarks")
.delete()
.eq("id", id);

};



// ✅ FINAL REALTIME FIX (RELIABLE METHOD)
useEffect(() => {

if (!user) return;

let ignore = false;

// realtime subscription
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


// 🔥 CRITICAL fallback — ensures instant sync across inactive tabs
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


// login screen
if (!user)
return (

<div className="flex justify-center items-center h-screen">

<button
onClick={login}
className="bg-blue-500 text-white px-6 py-3 rounded">

Login with Google

</button>

</div>

);




// main UI
return (

<div className="p-10">

<div className="flex justify-between">

<h1 className="text-3xl font-bold">
Smart Bookmark App
</h1>

<button
onClick={logout}
className="bg-red-500 text-white px-4 py-2 rounded">

Logout

</button>

</div>



<div className="mt-6">

<input
placeholder="Title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
className="border p-2 mr-2"
/>


<input
placeholder="URL"
value={url}
onChange={(e)=>setUrl(e.target.value)}
className="border p-2 mr-2"
/>


<button
onClick={addBookmark}
className="bg-green-500 text-white px-4 py-2">

Add

</button>

</div>



<div className="mt-6">

{bookmarks.map((b)=> (

<div
key={b.id}
className="border p-3 mt-2 flex justify-between">

<a
href={b.url}
target="_blank"
className="text-blue-500">

{b.title}

</a>

<button
onClick={()=>deleteBookmark(b.id)}
className="bg-red-500 text-white px-2">

Delete

</button>

</div>

))}

</div>

</div>

);

}
