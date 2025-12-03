import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Camera } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<void>;
  className?: string;
}

export function AvatarUpload({ currentAvatar, onUpload, className = '' }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar o tipo do arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Por favor, selecione um arquivo de imagem (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Verificar o tamanho do arquivo (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem não pode ser maior que 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Criar preview da imagem
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload da imagem
    try {
      setIsUploading(true);
      await onUpload(file);
      
      toast({
        title: 'Sucesso!',
        description: 'Foto de perfil atualizada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a foto de perfil',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const imageUrl = previewUrl || currentAvatar || '/images/avatars/default-avatar.png';

  return (
    <div className={`relative group ${className}`}>
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
        <img
          src={imageUrl}
          alt="Foto de perfil"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/avatars/default-avatar.png';
          }}
        />
        
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-white/20 hover:bg-white/30 text-white"
              onClick={handleClick}
            >
              <Camera className="h-5 w-5" />
              <span className="sr-only">Alterar foto</span>
            </Button>
          )}
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
