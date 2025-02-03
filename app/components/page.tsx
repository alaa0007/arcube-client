"use client";

import { JSX, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

const urlSchema = z.object({
    longUrl: z.string().url({ message: "Invalid URL format" }),
});

/**
 * UrlForm is a React component that provides a form for submitting URLs.
 * 
 * It uses the `react-hook-form` library for form state management,
 * and `zod` for input validation. The component renders an input field for a URL,
 * and a submit button. On submission, it sends a POST request with the URL to the server.
 * The component displays success or error messages based on the response.
 * 
 * @component
 * @returns {JSX.Element} The rendered component.
 */
const UrlForm = (): JSX.Element => {
    //HOOKS
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    //FORM
    const {register, handleSubmit, formState: { errors }} = useForm<{ longUrl: string }>({
        resolver: zodResolver(urlSchema),
    });


    /**
     * Submits the URL to the server.
     * 
     * @param {Object} data - The data to submit. Must contain a `url` property.
     * @param {string} data.url - The URL to submit.
     * 
     * On success, displays a success message.
     * On failure, displays an error message.
     * 
     * @returns {Promise<void>} The promise of the request.
    */
    const onSubmit = async (data: { longUrl: string }): Promise<void> => {
        setLoading(true);
        setMessage("");
    
        try {
            const response = await axios.post("http://localhost:3005/shorten", data);

            if (response.data.code !== 200) {
                setMessage("Error sending URL");
            } else {
                setMessage("URL sent successfully!");
                if(response.data.shortenedUrl === null) return;
                const redictedUrl = await axios.get(`http://localhost:3005/${response.data.shortenedUrl}`);
                console.log(redictedUrl);
                
                window.location.href = redictedUrl.data;
            }
        } catch (error) {
            setMessage("Error: " + (error instanceof Error ? error.message : "Unknown"));
        } finally {
            setLoading(false);
        }
    };

    //RENDER
    return (
        <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4">Enter a URL</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                <input
                    type="url"
                    placeholder="https://example.com"
                    {...register("longUrl")}
                    className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                />
                {errors.longUrl && ( <p className="text-red-500 text-sm mt-1">{errors.longUrl.message}</p>)}
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 disabled:bg-gray-300"
                >
                    {loading ? "Sending..." : "Send URL"}
                </button>
            </form>
            {message && <p className="mt-4 text-center">{message}</p>}
        </div>
    );
}

//EXPORT
export default UrlForm;