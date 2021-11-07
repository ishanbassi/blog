import githubCms from './github-cms'
import * as fsCms from './fs-cms'
import {GraphQLClient , gql , request} from 'graphql-request'
const  graphcms = new GraphQLClient(process.env.GRAPHCMS_API_URL)

function canUseGitHub() {
    return Boolean(process.env.GITHUB_PAT)
}

export async function getPostList() {
    
    
    const {posts} = await graphcms.request(`
        query MyQuery {
            posts {
                title,
                content,
                slug,
                createdAt,

            }
        }
    ` )

    return posts.map(post => ({
        ...post, createdAt: (new Date(post.createdAt)).getTime()
    }))
}
export async function getPost(slug) {
    const {post}   = await graphcms.request(`
        query MyQuery($slug:String) {
            post(where:  {slug:$slug}) {
                content,
                title,
                createdAt,
                slug
            }
        }
    `
    , {slug})
    return {
        ...post , 
        createdAt: (new Date(post.createdAt)).getTime()
    }
}

export async function deletePost(slug, {ownerId} = {}) {
    const mutation = gql`
        mutation deletePost($slug:String) {
            deletePost(where : {slug:$slug}) {
                slug
            }
                
        }
    `
    const post = await graphcms.request(mutation , {slug})
    console.log(post)
}

export async function createPost({ownerId, slug, title, content}) {
    const mutations = gql`
        mutation AddPost($ownerId: String!, $slug: String, $title: String, $content: String) {
        createPost(
            data: {ownerId: $ownerId, slug: $slug, content: $content, title: $title}
        ) {
            title ,content , slug , ownerId
        }
        publishPost(where : {slug:$slug}) {
            title
        }
        }

           
    `
    const {createPost}  = await graphcms.request(mutations, {slug, content , ownerId, title})
    
    return {
        ...createPost ,
        createdAt : (new Date(createPost.createdAt)).getTime()
    }
    
}

export async function updatePost({ownerId, slug, title, content}) {
    const mutation  = gql`
    
        mutation updatePost($ownerId:String! , $slug:String , $title:String, $content:String) {
            updatePost(where: {slug:$slug} data: {title:$title, content:$content , ownerId:$ownerId} ) {
                title , content , slug , ownerId
            }
            publishPost(where : {slug:$slug}) {
                id
            }
                
        }
    `
    const {updatePost} = await graphcms.request(mutation , {ownerId , slug , title , content})
    return {
        ...updatePost , 
        createdAt : (new Date(updatePost.createdAt)).getTime()
    }

}

export async function saveUser(type, profile) {
    
    if (canUseGitHub()) {
        return githubCms.saveUser(type, profile)
    }

    return fsCms.saveUser(type, profile)
}

export async function getUser(id) {
    if (canUseGitHub()) {
        return githubCms.getUser(id)
    }

    return fsCms.getUser(id)
}

export async function getComments(slug, options) {
    if (canUseGitHub()) {
        return githubCms.getCommentsWithPagination(slug, options)
    }

    return fsCms.getComments(slug, options)
}

export async function addComment(slug, comment) {
    if (canUseGitHub()) {
        return githubCms.addComment(slug, comment)
    }

    return fsCms.addComment(slug, comment)
}
