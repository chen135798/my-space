import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { DndContext, closestCenter, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

function DraggableCard({ id, name, x, y, color }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id })
  
  const style = {
    position: 'absolute',
    left: x,
    top: y,
    width: '180px',
    height: '120px',
    background: color,
    borderRadius: '12px',
    padding: '16px',
    color: 'white',
    cursor: 'grab',
    userSelect: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transform: CSS.Translate.toString(transform),
    zIndex: transform ? 999 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{name}</div>
    </div>
  )
}

export default function Space() {
  const [user, setUser] = useState(null)
  const [cards, setCards] = useState([
    { id: 'app-docs', name: '文档', x: 50, y: 50, color: '#667eea' },
    { id: 'app-sheets', name: '表格', x: 300, y: 50, color: '#764ba2' },
    { id: 'app-music', name: '音乐', x: 175, y: 220, color: '#f093fb' }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchLayout(data.user.id)
      else setLoading(false)
    })
  }, [])

  const fetchLayout = async (userId) => {
    const { data, error } = await supabase.from('layouts').select('layout_data').eq('user_id', userId).maybeSingle()
    if (data && data.layout_data && data.layout_data.length > 0) {
      setCards(data.layout_data)
    }
    setLoading(false)
  }

  const handleDragEnd = (event) => {
    const { active, delta } = event
    setCards((prev) => 
      prev.map((card) => 
        card.id === active.id ? { ...card, x: card.x + delta.x, y: card.y + delta.y } : card
      )
    )
  }

  const saveLayout = async () => {
    if (!user) return
    const { error } = await supabase.from('layouts').upsert({ 
      user_id: user.id, 
      layout_data: cards,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

    if (error) alert('保存失败: ' + error.message)
    else alert('布局已保存到云端！')
  }

  if (loading) return <div style={{ padding: 50 }}>加载中...</div>

  return (
    <div style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ padding: '10px 20px', background: 'white', borderBottom: '1px solid #ddd', display: 'flex', gap: '15px', alignItems: 'center', position: 'relative', zIndex: 100 }}>
        <h2 style={{ margin: 0, color: '#333' }}>我的云空间</h2>
        <span style={{ color: '#888', fontSize: '14px' }}>{user?.email}</span>
        <button onClick={saveLayout} style={{ padding: '8px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>保存布局</button>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} style={{ padding: '8px 20px', background: '#eee', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>退出登录</button>
      </div>
      
      <div style={{ position: 'absolute', top: '60px', left: 0, right: 0, bottom: 0 }}>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {cards.map((card) => (
            <DraggableCard key={card.id} {...card} />
          ))}
        </DndContext>
      </div>
      
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', color: '#aaa', fontSize: '14px' }}>
        拖动卡片改变位置，点击“保存布局”将位置保存到云端
      </div>
    </div>
  )
}