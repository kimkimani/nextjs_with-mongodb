import React from 'react';
import Navbar from './Nav';

export default function Layout(props: any) {
    return (
        <div>
            <Navbar />
            {
                props.children
            }
        </div>
    )
}