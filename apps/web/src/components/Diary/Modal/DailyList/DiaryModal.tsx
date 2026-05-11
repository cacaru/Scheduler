import React from 'react';
import { Plus, X as CloseIcon, Gift } from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { formatDateWithDay } from '@project/shared/src/utils/dateUtils';

// 분리된 컴포넌트 및 로직
import SortableEntryCard from './SortableEntryCard';
import EntryDetailView from './EntryDetailView';
import EntryEditForm from './EntryEditForm';
import AnniversaryModal from '../Anniversary/AnniversaryModal';
import { useDiaryModalLogic } from './useDiaryModalLogic';

import { useUIStore } from '@project/shared/src/store/uiStore';

import './DiaryModal.css';

/**
 * DiaryModal.tsx
 * 특정 날짜의 일기 및 할 일 목록을 관리하는 메인 모달 컨테이너입니다.
 * 목록 보기, 상세 보기, 입력 폼 등 3개 패널의 레이아웃과 데이터 흐름을 조율합니다.
 */

interface DiaryModalProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
}

const DiaryModal: React.FC<DiaryModalProps> = ({ date, isOpen, onClose }) => {
  const [isAnniModalOpen, setIsAnniModalOpen] = React.useState(false);
  const setModalOpen = useUIStore(state => state.setModalOpen);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { state, actions, form } = useDiaryModalLogic({ date, isOpen, onClose });

  // 하위 모달 상태 변경 시 스크롤 잠금 제어 (메인 DiaryModal은 이미 DiaryCalendar에서 처리됨)
  React.useEffect(() => {
    if (isAnniModalOpen) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [isAnniModalOpen, setModalOpen]);

  React.useEffect(() => {
    if (state.isFormOpen) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [state.isFormOpen, setModalOpen]);

  React.useEffect(() => {
    if (state.selectedDetailId) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [state.selectedDetailId, setModalOpen]);

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${state.isClosing ? 'closing' : ''}`} onClick={actions.handleDelayedClose}>
      {/* 1. 상세 보기 모달 - 항상 렌더링하되 내부에서 item 유무 판단 */}
      <EntryDetailView 
        item={state.selectedDetailItem}
        isOpen={!!state.selectedDetailId}
        onClose={() => actions.setSelectedDetailId(null)}
        onEdit={(item) => { 
          form.actions.handleEdit(item); 
          actions.setIsFormOpen(true); 
        }}
      />

      {/* 2. 목록 보기 모달 (중앙) */}
      <div 
        className={`independent-modal list-modal ${state.isClosing ? '' : 'is-open'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ width: 40 }} />
          <h3>{formatDateWithDay(date)}</h3>
          <button className="icon-btn" onClick={actions.handleDelayedClose}><CloseIcon size={20} /></button>
        </div>
        <div className="modal-body scrollable">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={actions.handleDragStart} onDragEnd={actions.handleDragEnd}>
            <SortableContext items={state.dayItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="entry-list">
                {state.dayItems.map(item => (
                  <>
                  <SortableEntryCard 
                    key={item.id}
                    item={item}
                    date={date}
                    isActive={state.selectedDetailId === item.id}
                    onSelect={actions.setSelectedDetailId}
                    onToggle={actions.toggleTodo}
                    onDelete={(d, id) => {
                      actions.deleteItem(d, id);
                      if(state.selectedDetailId === id) actions.setSelectedDetailId(null);
                    }}
                  />
                  </>
                  
                ))}
                {state.dayItems.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', color: '#a0aec0', fontWeight: 700 }}>기록이 없습니다.</div>}
              </div>
            </SortableContext>
            
            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.5' } },
              }),
            }}>
              {state.activeId && state.activeItem ? (
                <SortableEntryCard 
                  item={state.activeItem}
                  date={date}
                  isActive={state.selectedDetailId === state.activeId}
                  onSelect={() => {}}
                  onToggle={() => {}}
                  onDelete={() => {}}
                  isOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
        <div className="modal-footer">
          <button className="anni-reg-btn" onClick={() => setIsAnniModalOpen(true)}>
            <Gift size={20} /> 기념일 등록하기
          </button>
          <button className="add-btn" onClick={() => { form.actions.resetForm(); actions.setIsFormOpen(true); }}>
            <Plus size={20} /> 새 항목 추가
          </button>
        </div>
      </div>

      {/* 3. 입력 폼 모달 - 항상 렌더링하여 CSS transition 유지 */}
      <EntryEditForm 
        isOpen={state.isFormOpen}
        isEditing={!!form.formState.editingId}
        type={form.formState.type}
        title={form.formState.title}
        content={form.formState.content}
        selectedColor={form.formState.selectedColor}
        selectedLocation={form.formState.selectedLocation}
        showMap={form.formState.showMap}
        currentDate={form.formState.date}
        startDate={form.formState.startDate}
        endDate={form.formState.endDate}
        onClose={() => actions.setIsFormOpen(false)}
        setType={form.setters.setType}
        setTitle={form.setters.setTitle}
        setContent={form.setters.setContent}
        setSelectedColor={form.setters.setSelectedColor}
        setSelectedLocation={form.setters.setSelectedLocation}
        setShowMap={form.setters.setShowMap}
        onDateChange={form.setters.setDate}
        setStartDate={form.setters.setStartDate}
        setEndDate={form.setters.setEndDate}
        onSubmit={form.actions.handleAddOrUpdate}
      />

      {/* 4. 기념일 등록 모달 */}
      <AnniversaryModal 
        isOpen={isAnniModalOpen} 
        onClose={() => setIsAnniModalOpen(false)} 
        initialDate={date}
      />
    </div>
  );
};

export default DiaryModal;
