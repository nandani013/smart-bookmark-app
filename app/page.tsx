"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {

const [user, setUser] = useState<any>(null);
const [bookmarks, setBookmarks] = useState<any[]>([]);
const [title, setTitle] = useState("");
const [url, setUrl] = useState("");

useEffect(() => {

supabase.auth.getUser().then(({ data }) => {
 setUser(data.user);
 if(data.user) fetchBookmarks(data.user.id);
});

supabase.auth.onAuthStateChange((_event, session) => {
 setUser(session?.user ?? null);
});

}, []);


const login = async () => {

await supabase.auth.signInWithOAuth({
 provider: "google",
});

};


const logout = async () => {

await supabase.auth.signOut();

};


const fetchBookmarks = async (userId:any) => {

const { data } = await supabase
.from("bookmarks")
.select("*")
.eq("user_id", userId)
.order("created_at", { ascending:false });

setBookmarks(data || []);

};


const addBookmark = async () => {

if(!title || !url) return;

await supabase.from("bookmarks").insert({
 title,
 url,
 user_id:user.id
});

setTitle("");
setUrl("");

fetchBookmarks(user.id);

};


const deleteBookmark = async (id:any) => {

await supabase
.from("bookmarks")
.delete()
.eq("id", id);

fetchBookmarks(user.id);

};


useEffect(() => {

if(!user) return;

const channel = supabase
.channel("bookmarks")
.on(
 "postgres_changes",
 {
 event:"*",
 schema:"public",
 table:"bookmarks",
 },
 () => fetchBookmarks(user.id)
)
.subscribe();

return () => {
 supabase.removeChannel(channel);
};

},[user]);



if(!user)
return (

<div className="flex justify-center items-center h-screen">

<button
onClick={login}
className="bg-blue-500 text-white px-6 py-3 rounded">

Login with Google

</button>

</div>

);


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

<div>

<a
href={b.url}
target="_blank"
className="text-blue-500">

{b.title}

</a>

</div>


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
