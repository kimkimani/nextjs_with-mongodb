import React, { useState } from "react";
import type {
    GetStaticPropsContext,
    GetStaticPropsResult,
} from 'next';
import Layout from '../../components/Layout';

type PageParams = {
    id: string
}

type ContentPageProps = {
    post: Post;
}

type Post = {
    _id: string;
    title: string;
    content: string;
}

type ResponseFromServer = {
    title: string;
    content: string;
    _id: string
}

export async function getStaticProps({
    params
}: GetStaticPropsContext<PageParams>): Promise<GetStaticPropsResult<ContentPageProps>> {
    try {
        let response = await fetch('http://localhost:3000/api/getPost?id=' + params?.id);

        let responseFromServer: ResponseFromServer = await response.json();

        return {
            // Passed to the page component as props
            props: {
                post: {
                    _id: responseFromServer._id,
                    title: responseFromServer.title,
                    content: responseFromServer.content
                }
            },
        }
    } catch (e) {
        console.log('error ', e);
        return {
            props: {
                post: {
                    _id: '',
                    title: '',
                    content: ''
                }
            }
        }
    }

}

export async function getStaticPaths() {
    let posts = await fetch('http://localhost:3000/api/getPosts');

    let postFromServer: [Post] = await posts.json();
    return {
        paths: postFromServer.map((post) => {
            return {
                params: {
                    id: post._id
                }
            }
        }),
        fallback: false, // can also be true or 'blocking'
    }
}

export default function EditPost({ post: { _id, title, content } }: ContentPageProps) {

    const [postTitle, setPostTitle] = useState(title);
    const [postContent, setPostContent] = useState(content);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (postTitle && postContent) {
            try {
                let response = await fetch('http://localhost:3000/api/editPost?id=' + _id, {
                    method: 'POST',
                    body: JSON.stringify({
                        title: postTitle,
                        content: postContent
                    }),
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }
                });
                response = await response.json();
                setPostTitle('');
                setPostContent('');
                setError('');
                setMessage('Post edited successfully');
            } catch (errorMessage: any) {
                setError(errorMessage);
            }
        } else {
            return setError('All fields are required')
        }
    }

    // no such post exists
    if (!title && !content && !id && process.browser) {
        return window.location.href = '/';
    }

    return (
        <Layout>
            <form onSubmit={handleSubmit} className="form">
                {
                    error ? (
                        <div className="alert-error">
                            {error}
                        </div>
                    ) : null
                }
                {
                    message ? (
                        <div className="alert-message">
                            {message}
                        </div>
                    ) : null
                }
                <div className="form-group">
                    <label>Title</label>
                    <input type="text"
                        placeholder="Title of the post"
                        onChange={e => setPostTitle(e.target.value)}
                        value={postTitle ? postTitle : ''}
                    />
                </div>
                <div className="form-group">
                    <label>Content</label>
                    <textarea
                        name="content"
                        placeholder="Content of the post"
                        value={postContent ? postContent : ''}
                        onChange={e => setPostContent(e.target.value)}
                        cols={20}
                        rows={8}
                    />
                </div>
                <div className="form-group">
                    <button type="submit" className="submit_btn">Update</button>
                </div>
            </form>
            <style jsx>
                {`
                    .form{
                        width:400px;
                        margin:10px auto;
                    }
                    .form-group{
                        width:100%;
                        margin-bottom:10px;
                        display:block;
                    }
                    .form-group label{
                        display:block;
                        margin-bottom:10px;
                    }
                    .form-group input[type="text"]{
                        padding:10px;
                        width:100%;
                    }
                    .form-group textarea{
                        padding:10px;
                        width:100%;
                    }
                    .alert-error{
                        width:100%;
                        color:red;
                        margin-bottom:10px;
                    }
                    .alert-message{
                        width:100%;
                        color:green;
                        margin-bottom:10px;
                    }
                `
                }
            </style>
        </Layout>
    )
}