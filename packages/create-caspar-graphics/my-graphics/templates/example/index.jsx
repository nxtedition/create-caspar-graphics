import { render, Crawl, useRssFeed } from '@nxtedition/graphics-kit'

function RssCrawl() {
  const feed = useRssFeed('https://feeds.simplecast.com/54nAGcIl')
  console.log(1, feed)

  return (
    <div
      style={{
        background: 'white',
        position: 'absolute',
        bottom: 88,
        left: 125,
        right: 125,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        fontSize: 30,
        fontFamily: 'sans-serif'
      }}
    >
      <div
        style={{
          flex: '0 0 auto',
          alignSelf: 'stretch',
          display: 'flex',
          alignItems: 'center',
          background: 'black',
          color: 'white',
          padding: '0 20px'
        }}
      >
        {feed?.title}
      </div>
      <div
        style={{
          lineHeight: '45px',
          height: '45px',
          flex: '1 0 0',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Crawl
          play
          items={feed?.items?.slice(0, 10)}
          Separator={<div />}
          renderItem={({ id, title }) => (
            <div key={id} style={{ whiteSpace: 'nowrap', marginRight: 20 }}>
              {title}
            </div>
          )}
        />
      </div>
    </div>
  )
}

render(RssCrawl)

// import { render, useCaspar, FramerMotion } from '@nxtedition/graphics-kit'
// import { motion } from 'framer-motion'
//
// function Example() {
//   const { data } = useCaspar()
//
//   return (
//     <FramerMotion>
//       <motion.div
//         style={{
//           position: 'absolute',
//           bottom: 210,
//           left: 266,
//           padding: '10px 20px',
//           backgroundColor: 'rebeccapurple',
//           color: 'white',
//           borderRadius: 6,
//           fontSize: 30,
//           fontFamily: 'Arial',
//           overflow: 'hidden'
//         }}
//         initial={{
//           opacity: 0,
//           y: '100%'
//         }}
//         animate={{
//           opacity: 1,
//           y: 0,
//           transition: {
//             duration: 0.3,
//             delay: 0.3
//           }
//         }}
//       >
//         {data.title}
//       </motion.div>
//       <motion.div
//         initial={{
//           opacity: 0,
//           y: 100
//         }}
//         animate={{
//           opacity: 1,
//           y: 0,
//           transition: {
//             opacity: {
//               duration: 0.4
//             },
//             y: {
//               duration: 0.6
//             }
//           }
//         }}
//         exit={{
//           y: 100,
//           opacity: 0,
//           transition: {
//             duration: 0.4
//           }
//         }}
//         style={{
//           position: 'absolute',
//           bottom: 80,
//           left: 266,
//           width: 1388,
//           padding: 20,
//           backgroundColor: 'white',
//           borderRadius: 6,
//           fontSize: 70,
//           fontFamily: 'Arial',
//           overflow: 'hidden'
//         }}
//       >
//         <motion.div
//           initial={{
//             opacity: 0,
//             y: '100%'
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//             transition: {
//               duration: 0.3,
//               delay: 0.3
//             }
//           }}
//         >
//           {data.name}
//         </motion.div>
//       </motion.div>
//     </FramerMotion>
//   )
// }
//
// render(Example)
