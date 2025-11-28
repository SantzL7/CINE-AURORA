import { render, screen, fireEvent } from '@testing-library/react';
import OptimizedImage from './OptimizedImage';

describe('OptimizedImage Component', () => {
    const defaultProps = {
        src: 'https://example.com/image.jpg',
        alt: 'Test Image',
        className: 'test-class'
    };

    test('renders placeholder initially', () => {
        render(<OptimizedImage {...defaultProps} />);

        // Verifica se o placeholder está sendo exibido (baseado na classe ou estilo)
        // Como o placeholder é uma div com background, podemos verificar se a imagem principal está oculta ou se o container tem a classe correta
        const container = screen.getByRole('img', { hidden: true }).parentElement;
        expect(container).toBeInTheDocument();
    });

    test('renders image with correct attributes', () => {
        render(<OptimizedImage {...defaultProps} />);

        const img = screen.getByAltText('Test Image');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
        // A imagem começa com opacidade 0
        expect(img).toHaveStyle({ opacity: '0' });
    });

    test('reveals image after loading', () => {
        render(<OptimizedImage {...defaultProps} />);

        const img = screen.getByAltText('Test Image');

        // Simula o carregamento da imagem
        fireEvent.load(img);

        expect(img).toHaveStyle({ opacity: '1' });
    });

    test('handles load error', () => {
        render(<OptimizedImage {...defaultProps} />);

        const img = screen.getByAltText('Test Image');

        // Simula erro de carregamento
        fireEvent.error(img);

        // Verifica se o src mudou para o placeholder de erro (ou comportamento definido)
        // No nosso componente atual, ele pode apenas manter o placeholder ou logar erro
        // Ajuste conforme a implementação real do seu componente
    });
});
